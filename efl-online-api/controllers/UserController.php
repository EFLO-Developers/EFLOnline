<?php
//require_once __DIR__ . '/../models/User.php';
//require_once __DIR__ . '/../models/AuthToken.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Assuming you use Composer for UUID and Guzzle
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
        }
    }


    //GET ActiveUser
    public function getActiveUser($eflo_access_token) {


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
        $endpoint = "https://discord.com/api/users/@me/guilds/{$_ENV['DISCORD_EFLSERVERID']}/member";

        try {

            
            // Check if LastDiscordSync is older than 10 minutes from now
            $lastSync = $user['LastDiscordSync'] ? new DateTime($user['LastDiscordSync']) : new DateTime('2000-01-01');

            $now = new DateTime();
            $interval = $now->getTimestamp() - $lastSync->getTimestamp();

            if ($interval > 600) { // 600 seconds = 10 minutes
            

                $response = $this->client->get($endpoint, [
                    'headers' => [
                        'Authorization' => "Bearer $bearer"
                    ]
                ]);

                $member = json_decode($response->getBody(), true);

                // Update LastDiscordSync column to current datetime
                $stmt = $this->pdo->prepare("UPDATE User SET LastDiscordSync = NOW() WHERE UserId = ?");
                $stmt->execute([$user['UserId']]);

                // Update user info if necessary
                if ($user['DiscordNick'] !== $member['nick']) {
                    $stmt = $this->pdo->prepare("UPDATE User SET DiscordNick = ?, UpdateDate = NOW() WHERE UserId = ?");
                    $stmt->execute([$member['nick'], $user['UserId']]);
                }

            }


            return [
                'eflo_member' => [
                    'Id' => $user['UserId'],
                    'DiscordId' => $user['DiscordId'],
                    'DiscordNick' => $user['DiscordNick'],
                    'ForumNick' => $user['ForumNick'],
                    'RecruitedBy' => $user['RecruitedBy'],
                    'AgencyName' => $user['AgencyName']
                ]
            ];
        } catch (Exception $e) {
            return ['error' => 'Failed to validate auth token with Discord'];
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
                    'Nick' => $user['DiscordNick'],
                    'ForumNick' => $user['ForumNick'],
                    'RecruitedBy' => $user['RecruitedBy'],
                    'AgencyName' => $user['AgencyName'],
                    'UpdateDate' => $user['UpdateDate']
                ]
            ];


        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch user'];
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
            $stmt = $this->pdo->prepare("UPDATE User SET ForumNick = ?, RecruitedBy = ?, AgencyName = ?, UpdateDate = NOW() WHERE UserId = ?");
            $stmt->execute([
                $efloMember['ForumNick'],
                $efloMember['RecruitedBy'],
                $efloMember['AgencyName'],
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
        }
    }

    //GetActiveUser

}

?>