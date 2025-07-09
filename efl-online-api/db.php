<?php


require_once __DIR__ . '/vendor/autoload.php'; // Assuming you use Composer for UUID and Guzzle
use Ramsey\Uuid\Uuid;


class Database {
    private static $instance = null;
    private $pdo;
    private $route;
    private $connectionId;

    private function __construct($route) {
        $this->route = $route;


        
        $host = 'srv554.hstgr.io';
        $db = 'u948353728_EFLOnline';
        $user = 'u948353728_EFLODeveloper';
        
        
        $host = '89.116.170.37';
        $db = 'EFLOnline';
        $user = 'EFLDeveloper';
        
        $pass = 'TurnerShaka2025@';
        $charset = 'utf8mb4';

        $this->connectionId = Uuid::uuid4()->toString();

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
            $this->logConnection('opened');
        } catch (\PDOException $e) {
            throw new \PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    public function __destruct() {
        $this->logConnection('closed');
        $this->pdo = null;
    }

    public static function getInstance($route) {
        if (self::$instance === null) {
            self::$instance = new Database($route);
        }
        return self::$instance;
    }

    public function getConnection() {
        $this->logConnection('accessed');
        return $this->pdo;
    }


    private function logConnection($action) {
    
        try {
          
            $stmt = $this->pdo->prepare("INSERT INTO APILog (ConnectionId, Route, Action, Message, TimeStamp) 
                                            VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([   
                $this->connectionId,
                $this->route,
                $action, 
                'Database connection ' . $action
            ]);
            error_log('connection action logged ' . $action);

        } catch (\PDOException $e) {
            // Handle logging failure (optional)
            error_log('Failed to log connection action');
        }
    }


}
?>