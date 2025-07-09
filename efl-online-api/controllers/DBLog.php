<?php
// DBLog handles logging API actions to the APILog table

require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload for dependencies
require_once __DIR__ . '/EFLOAuthController.php';
require_once __DIR__ . '/UserController.php';

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class DBLog {
    private $pdo;
    private $client;
    private $eflOAuthController;
    private $userController;

    // Constructor initializes PDO, HTTP client, and controllers
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo);
        $this->userController = new UserController($pdo);
    }

    // Log opening a connection
    public function OpenConn($route) {
        $this->AddLog($route, 'OPEN', 'Open connection', date('Y-m-d H:i:s'));
    }

    // Log closing a connection
    public function CloseConn($route) {
        $this->AddLog($route, 'CLOSE', 'Closed connection', date('Y-m-d H:i:s'));
    }

    // Add a log entry to the APILog table
    public function AddLog($route, $action, $message, $timestamp) {
        try {
            // Ensure PDO connection is initialized
            if ($this->pdo === null) {
                $message = 'Database connection is not initialized.';
            }

            // Prepare and execute the insert statement
            $stmt = $this->pdo->prepare(
                "INSERT INTO APILog (Route, Action, Message, TimeStamp) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([
                $route,
                $action,
                $message,
                $timestamp
            ]);
            // No need to fetch after an INSERT
        } catch (Exception $e) {
            return ['error' => 'Error adding log'];
        }
    }
}
?>