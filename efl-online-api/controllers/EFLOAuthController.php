<?php
// EFLOAuthController handles Discord OAuth authentication and token management

require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload for UUID and Guzzle

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class EFLOAuthController {
    private $pdo;
    private $client;

    // Constructor to initialize PDO and HTTP client
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
    }

    /**
     * Generates a new AuthToken for a Discord user.
     * - Validates required parameters.
     * - Checks if user exists, creates if not.
     * - Removes old tokens and inserts a new one.
     */
    public function generateAuthToken($params, $closeConn = true) {
        try {
            // Ensure all required parameters are present
            $requiredParams = ['DiscordAccessToken', 'DiscordRefreshToken', 'DiscordId', 'ExpirationTime'];
            foreach ($requiredParams as $param) {
                if (!isset($params[$param])) {
                    return ['error' => 'Missing required parameters'];
                }
            }

            $discordAccessToken = $params['DiscordAccessToken'];
            $discordRefreshToken = $params['DiscordRefreshToken'];
            $discordId = $params['DiscordId'];
            $expirationTime = $params['ExpirationTime'];

            // Check if user exists in the database
            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE DiscordId = ?");
            $stmt->execute([$discordId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                // Fetch Discord member info to validate and get nickname
                $endpoint = "https://discord.com/api/users/@me/guilds/{$_ENV['DISCORD_EFLSERVERID']}/member";
                $response = $this->client->get($endpoint, [
                    'headers' => [
                        'Authorization' => "Bearer $discordAccessToken"
                    ]
                ]);
                $member = json_decode($response->getBody(), true);

                // Validate Discord ID matches
                if ($member['user']['id'] == $discordId) {
                    $nickname = $member['nick'] ?? $member["user"]["global_name"];
                    $userId = Uuid::uuid4()->toString();
                    // Insert new user into the database
                    $stmt = $this->pdo->prepare(
                        "INSERT INTO User (UserId, DiscordId, DiscordNick, ForumNick, RecruitedBy, AgencyName, LastLoginDate, CreateDate, UpdateDate, LastDiscordSync) 
                         VALUES (?, ?, ?, NULL, NULL, NULL, NOW(), NOW(), NOW(), NOW())"
                    );
                    $stmt->execute([
                        $userId, 
                        $discordId, 
                        $nickname
                    ]);
                } else {
                    return ['error' => 'Failed to validate given DiscordId'];
                }
            } else {
                $userId = $user['UserId'];
            }

            // Remove any existing tokens for this user
            $stmt = $this->pdo->prepare("DELETE FROM AuthToken WHERE UserId = ?");
            $stmt->execute([$userId]);

            // Insert new AuthToken
            $tokenId = Uuid::uuid4()->toString();
            $stmt = $this->pdo->prepare(
                "INSERT INTO AuthToken (TokenId, UserId, GrantDate, ExpireDate, DiscordAccessToken, DiscordRefreshToken) 
                 VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?)"
            );
            $stmt->execute([
                $tokenId, 
                $userId, 
                $expirationTime, 
                $discordAccessToken, 
                $discordRefreshToken
            ]);

            return ['AuthTokenId' => $tokenId];
        } catch (PDOException $e) {
            return ['error' => 'Failed to generate token: ' . $e->getMessage()];
        } finally {
            // Close the connection if requested
            if ($closeConn) {
                $this->pdo = null;
            }
        }
    }

    /**
     * Validates an existing AuthToken.
     * - Checks if token exists and is valid.
     * - If expired, attempts to refresh using the refresh token.
     */
    public function validateAuthToken($eflo_access_token, $closeConn = true) {
        try {
            if (!$eflo_access_token) {
                return ['valid' => false, 'error' => 'Missing required parameters in API Validate Token'];
            }

            // Fetch the AuthToken from the database
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $existingAuthToken = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$existingAuthToken) {
                return ['valid' => false, 'error' => 'Auth token not found'];
            }

            $bearer = $existingAuthToken['DiscordAccessToken'];
            $endpoint = "https://discord.com/api/v10/users/@me";

            try {
                // Try to validate the access token with Discord
                $response = $this->client->get($endpoint, [
                    'headers' => [
                        'Authorization' => "Bearer $bearer"
                    ]
                ]);
                return ['valid' => true, 'refreshed' => false];
            } catch (Exception $e) {
                // If access token is invalid, try to refresh it
                $refreshToken = $existingAuthToken['DiscordRefreshToken'];
                $params = [
                    'client_id' => $_ENV['DISCORD_CLIENTID'],
                    'client_secret' => $_ENV['DISCORD_CLIENTSECRET'],
                    'grant_type' => 'refresh_token',
                    'refresh_token' => $refreshToken,
                    'redirect_uri' => $_ENV['DISCORD_CALLBACK']
                ];

                try {
                    $response = $this->client->post('https://discord.com/api/oauth2/token', [
                        'form_params' => $params,
                        'headers' => [
                            'Content-Type' => 'application/x-www-form-urlencoded'
                        ]
                    ]);
                    $data = json_decode($response->getBody(), true);
                    $newAccessToken = $data['access_token'];
                    $newRefreshToken = $data['refresh_token'];
                    $expiresIn = $data['expires_in'];

                    // Update the AuthToken with new values
                    $stmt = $this->pdo->prepare(
                        "UPDATE AuthToken SET DiscordAccessToken = ?, DiscordRefreshToken = ?, ExpireDate = DATE_ADD(NOW(), INTERVAL ? SECOND) WHERE TokenId = ?"
                    );
                    $stmt->execute([$newAccessToken, $newRefreshToken, $expiresIn, $eflo_access_token]);

                    return ['valid' => true, 'refreshed' => true];
                } catch (Exception $e) {
                    return ['error' => 'Invalid refresh token'];
                }
            }
        } catch (PDOException $e) {
            return ['error' => 'Failed to validate token'];
        } finally {
            // Close the connection if requested
            if ($closeConn) {
                $this->pdo = null;
            }
        }
    }
}
?>