<?php
//require_once __DIR__ . '/../models/User.php';
//require_once __DIR__ . '/../models/AuthToken.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Requires Composer for dependency management (UUID, Guzzle, etc.)
require_once __DIR__ . '/EFLOAuthController.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;



class UserController {
    private $pdo;
    private $client;
    private $eflOAuthController;

    // Fallback date for LastDiscordSync when not set
    private const FALLBACK_LAST_DISCORD_SYNC = '2000-01-01';

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo); // Initialize EFLOAuthController
    }

    //GET Users
    public function getUsers($eflo_access_token) {
        
        // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
        $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);



        if (!$tokenStatus['valid']) {
            return ['error' => 'Invalid or expired access token'];
        }


        try {
            $stmt = $this->pdo->query("SELECT * FROM User");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $users;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch users'];
        } finally {
            // No need to close the connection here
        }
    }


    //GET ActiveUser
    public function getActiveUser($eflo_access_token, $closeConn = true) {


        if(!$eflo_access_token){
            return ['error' => 'access token not provided'];
        }

        // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
        $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);


        if (!$tokenStatus['valid']) {
            return ['error' => 'Invalid or expired access token'];
        }

        
        $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
        $stmt->execute([$eflo_access_token]);
        $token = $stmt->fetch(PDO::FETCH_ASSOC);

        $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
        $stmt->execute([$token['UserId']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return ['error' => 'User not found'];
        }

        $bearer = $token["DiscordAccessToken"];

        if (empty($_ENV['DISCORD_EFLSERVERID'])) {
            return ['error' => 'DISCORD_EFLSERVERID environment variable is not set'];
        }
        $endpoint = "https://discord.com/api/users/@me/guilds/{$_ENV['DISCORD_EFLSERVERID']}/member";

        try {

            
            // Check if LastDiscordSync is older than 10 minutes from now
            $lastSync = $user['LastDiscordSync'] ? new DateTime($user['LastDiscordSync']) : new DateTime('2000-01-01');

            $now = new DateTime();
            $interval = $now->getTimestamp() - $lastSync->getTimestamp();

            // Use a fallback date if LastDiscordSync is not set
            $lastSync = $user['LastDiscordSync'] ? new DateTime($user['LastDiscordSync']) : new DateTime(self::FALLBACK_LAST_DISCORD_SYNC);
            if ($interval > 600) { // 600 seconds = 10 minutes

                $response = $this->client->get($endpoint, [
                    'headers' => [
                        'Authorization' => "Bearer $bearer"
                    ]
                ]);

                $member = json_decode($response->getBody(), true);

                $nickname = $member['nick'] ?? ($member['user']['global_name'] ?? null);
                $stmt = $this->pdo->prepare("UPDATE User SET LastDiscordSync = NOW() WHERE UserId = ?");
                $stmt->execute([$user['UserId']]);

                $nickname = $member['nick'] ?? $member["user"]["global_name"];

                // Update user info if necessary
                if ($user['DiscordNick'] !== $nickname) {
                    $stmt = $this->pdo->prepare("UPDATE User SET DiscordNick = ?, UpdateDate = NOW() WHERE UserId = ?");
                    $stmt->execute([
                        $nickname, 
                        $user['UserId']
                    ]);
                }

            }

            // Always fetch security groups, regardless of Discord sync
            $stmt = $this->pdo->prepare("SELECT sg.Name FROM SecurityGroup sg INNER JOIN SecurityGroupMembership sgm on sg.GroupId = sgm.GroupId WHERE (sgm.ExpireDate IS NULL OR sgm.ExpireDate > NOW()) AND sgm.UserId = ?");
            $stmt->execute([$token['UserId']]);
            $security_groups = $stmt->fetchAll(PDO::FETCH_COLUMN);

            return [
                'eflo_member' => [
                    'Id' => $user['UserId'],
                    'DiscordId' => $user['DiscordId'],
                    'DiscordNick' => $user['DiscordNick'],
                    'ForumNick' => $user['ForumNick'],
                    'RecruitedBy' => $user['RecruitedBy'],
                    'AgencyName' => $user['AgencyName'],
                    'security_groups' => $security_groups

                    ]
            ];
            
        } catch (Exception $e) {
            return ['error' => 'Failed to validate auth token with Discord'];
        } finally {
            // Close the connection
            // Optionally close the connection (removed to prevent issues with reused controller instances)
            // if($closeConn)
            //     $this->pdo = null;
        }
    }


    //GET User/{UserId}
    public function getUserById($eflo_access_token, $userId) {

        // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
        $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

        if (!$tokenStatus['valid']) {
            return ['error' => 'Invalid or expired access token'];
        }

        try {



            //use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
            //the EFLOAuthController.ValidateAuthTOken can be used to validate a token



            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }


            
            return [
                'eflo_member' => [
                    'Id' => $user['UserId'],
                    'DiscordId' => $user['DiscordId'],
                    'DiscordNick' => $user['DiscordNick'],
                    'ForumNick' => $user['ForumNick'],
                    'RecruitedBy' => $user['RecruitedBy'],
                    'AgencyName' => $user['AgencyName'],
                    'UpdateDate' => $user['UpdateDate']
                ]
            ];
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch user'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    //POST User - Update user from body payload
    public function updateUser($eflo_access_token, $userId, $efloMember) {
        // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
        $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

        if (!$tokenStatus['valid']) {
            return ['error' => 'Invalid or expired access token'];
        }

        try {
            // Sanitize and validate input
            $forumNick = isset($efloMember['ForumNick']) ? filter_var($efloMember['ForumNick'], FILTER_SANITIZE_STRING) : null;
            $recruitedBy = isset($efloMember['RecruitedBy']) ? filter_var($efloMember['RecruitedBy'], FILTER_SANITIZE_STRING) : null;
            $agencyName = isset($efloMember['AgencyName']) ? filter_var($efloMember['AgencyName'], FILTER_SANITIZE_STRING) : null;

            if ($forumNick === null || $recruitedBy === null || $agencyName === null) {
                return ['error' => 'Invalid input data'];
            }

            $stmt = $this->pdo->prepare("UPDATE User SET ForumNick = ?, RecruitedBy = ?, AgencyName = ?, UpdateDate = NOW() WHERE UserId = ?");
            $stmt->execute([
                $forumNick,
                $recruitedBy,
                $agencyName,
                $userId
            ]);
    
            if ($stmt->rowCount() === 0) {
                return ['error' => 'User not found or no changes made'];
            }



            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            

            return [
                'eflo_member' => [
                    'Id' => $user['UserId'],
                    'DiscordId' => $user['DiscordId'],
                    'DiscordNick' => $user['DiscordNick'],
                    'ForumNick' => $user['ForumNick'],
                    'RecruitedBy' => $user['RecruitedBy'],
                    'AgencyName' => $user['AgencyName'],
                    'UpdateDate' => $user['UpdateDate']
                ]
            ];
        } catch (PDOException $e) {
            return ['error' => 'Failed to update user'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

}

?>