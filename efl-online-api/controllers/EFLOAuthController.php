<?php
//require_once __DIR__ . '/../models/User.php';
//require_once __DIR__ . '/../models/AuthToken.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Assuming you use Composer for UUID and Guzzle

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class EFLOAuthController {
    private $pdo;
    private $client;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
    }

    public function generateAuthToken($params) {
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

        $stmt = $this->pdo->prepare("SELECT * FROM User WHERE DiscordId = ?");
        $stmt->execute([$discordId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            $endpoint = "https://discord.com/api/users/@me/guilds/{$_ENV['DISCORD_EFLSERVERID']}/member";

            try {
                $response = $this->client->get($endpoint, [
                    'headers' => [
                        'Authorization' => "Bearer $discordAccessToken"
                    ]
                ]);

                $member = json_decode($response->getBody(), true);

                if ($member['user']['id'] == $discordId) {
                    $userId = Uuid::uuid4()->toString();
                    $stmt = $this->pdo->prepare("INSERT INTO User (UserId, DiscordId, Nick, CreateDate, UpdateDate, LastLoginDate, LastDiscordSync) VALUES (?, ?, ?, NOW(), NOW(), NOW(), NOW())");
                    $stmt->execute([$userId, $discordId, $member['nick']]);
                } else {
                    return ['error' => 'Failed to validate given DiscordId'];
                }
            } catch (Exception $e) {
                return ['error' => 'Failed to validate access token'];
            }
        } else {
            $userId = $user['UserId'];
        }

        $stmt = $this->pdo->prepare("DELETE FROM AuthToken WHERE UserId = ?");
        $stmt->execute([$userId]);

        $tokenId = Uuid::uuid4()->toString();
        $stmt = $this->pdo->prepare("INSERT INTO AuthToken (TokenId, UserId, GrantDate, ExpireDate, DiscordAccessToken, DiscordRefreshToken) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? SECOND), ?, ?)");
        $stmt->execute([$tokenId, $userId, $expirationTime, $discordAccessToken, $discordRefreshToken]);

        return ['AuthTokenId' => $tokenId];
    }

    public function validateAuthToken($eflo_access_token) {
        if (!$eflo_access_token) {
            return ['valid' => false, 'error' => 'Missing required parameters in api Validate TOken'];
        }

        $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
        $stmt->execute([$eflo_access_token]);
        $existingAuthToken = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$existingAuthToken) {
            return ['valid' => false, 'error' => 'Auth token not found'];
        }

        $bearer = $existingAuthToken['DiscordAccessToken'];
        $endpoint = "https://discord.com/api/v10/users/@me";

        try {
            $response = $this->client->get($endpoint, [
                'headers' => [
                    'Authorization' => "Bearer $bearer"
                ]
            ]);

            return ['valid' => true, 'refreshed' => false];
        } catch (Exception $e) {
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

                $stmt = $this->pdo->prepare("UPDATE AuthToken SET DiscordAccessToken = ?, DiscordRefreshToken = ?, ExpireDate = DATE_ADD(NOW(), INTERVAL ? SECOND) WHERE TokenId = ?");
                $stmt->execute([$newAccessToken, $newRefreshToken, $expiresIn, $authTokenId]);

                return ['valid' => true, 'refreshed' => true];
            } catch (Exception $e) {
                return ['error' => 'Invalid refresh token'];
            }
        }
    }
}
?>