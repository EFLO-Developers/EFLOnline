<?php
// HelloController provides a simple hello world API endpoint

class HelloController {
    private $pdo;

    // Constructor to initialize PDO connection
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Returns a simple hello world message as an array
    public function helloWorld() {
        return ['message' => 'HELLO WORLD'];
    }
}
?>