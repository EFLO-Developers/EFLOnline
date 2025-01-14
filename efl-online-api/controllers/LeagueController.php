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

    public function GetTeams($teamId) {
        //return team info and list of active players on team
        return ['error' => 'Failed to fetch users'];
    }

    public function getUsers() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM User");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $users;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch users'];
        }
    }