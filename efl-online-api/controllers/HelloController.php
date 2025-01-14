<?php
    class HelloController {
        private $pdo;

        public function __construct($pdo) {
            $this->pdo = $pdo;
        }

        public function helloWorld() {
            return ['message' => 'HELLO WORLD'];
        }

    }
?>