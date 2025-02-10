<?php
//require_once __DIR__ . '/../models/User.php';
//require_once __DIR__ . '/../models/AuthToken.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Assuming you use Composer for UUID and Guzzle
require_once __DIR__ . '/EFLOAuthController.php';
require_once __DIR__ . '/UserController.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;


class DBLog {
    private $pdo;
    private $client;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo); // Initialize EFLOAuthController
        $this->userController = new UserController($pdo); // Initialize UserController
    }


    public function OpenConn($route){
        AddLog($route, 'OPEN', 'Open connection', date('Y-m-d H:i:s'));
    }

    public function CloseConn($route){
        AddLog($route, 'CLOSE', 'Closed connection', date('Y-m-d H:i:s'));
    }

    public function AddLog($route, $action, $message, $timestamp){

        try{
            // Ensure PDO connection is initialized
            if ($this->pdo === null) {
                $message = 'Database connection is not initialized.';
            }

            $stmt = $this->pdo->prepare("INSERT INTO APILog (Route, Action, Message, TimeStamp) 
                                            VALUES (?, ?, ?, ?)");
            $stmt->execute([          
                $route, 
                $action, 
                $message, 
                $timestamp
            ]);
            $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
            return ['error' => 'Error adding log'];
        }
    }

}


?>