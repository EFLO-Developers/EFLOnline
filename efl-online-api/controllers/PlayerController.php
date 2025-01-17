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



class PlayerController {
    private $pdo;
    private $client;
    private $eflOAuthController;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo); // Initialize EFLOAuthController
    }

    public function GetPlayers(){
        try {
            $stmt = $this->pdo->query("SELECT * FROM Player");
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $players;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch players'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    
    public function GetActivePlayers(){
        try {
            $stmt = $this->pdo->query("SELECT * FROM Player Where IsRetired = 0");
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $players;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    
    public function GetPlayerById($playerId){
        try {
            $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);
            return $player;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch player with id: ' . $playerId];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    public function UpsertPlayer($player){

        try {
            

            //GET USER ID FROM THE TOKEN

            //CHECK IF USER ALREADY HAS A PLAYER WITH THE GIVEN ARCHETYPE CATEGORY

            $stmt = $this->pdo->prepare("SELECT ActiveSeason FROM League WHERE LeagueId = ?");
            $stmt->execute([
                $player['LeagueId'],
            ]);
            $activeSeason = $stmt->fetch(PDO::FETCH_ASSOC)['ActiveSeason'];
            

            $existingPlayer = null;

            if($player['PlayerId'] != null){
                $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
                $stmt->execute([$player['PlayerId']]);
                $existingPlayer = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if($existingPlayer != null){
                //UPDATE EXISTING PLAYER
                //CREATE NEW PLAYER
                $stmt = $this->pdo->prepare("UPDATE Player SET LeagueId = ?, TeamId = ?, SeasonCreated = ?, FirstName = ?, LastName = ?, Nickname = ?, JerseyNumber = ?, ArchetypeId = ?, Height = ?, Weight = ? 
                                                            WHERE PlayerId = ?");
                $stmt->execute([
                    $player['LeagueId'],
                    $player['TeamId'],
                    $player['SeasonCreated'],
                    $player['FirstName'],
                    $player['LastName'],
                    $player['Nickname'],
                    $player['JerseyNumber'],
                    $player['ArchetypeId'],
                    $player['Height'],
                    $player['Weight'],
                    $player['PlayerId']
                    
                ]);

                $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
                $stmt->execute([$player['PlayerId']]);
                $player = $stmt->fetch(PDO::FETCH_ASSOC);
                $status = "Player Updated Successfully";
            }
            else{
                //CREATE NEW PLAYER
                $stmt = $this->pdo->prepare("INSERT Player      (LeagueId, UserId, TeamId, SeasonCreated, FirstName, LastName, Nickname, JerseyNumber, ArchetypeId, Height, Weight, CreateDate) 
                                                        VALUES  (?,?,?,?,?,?,?,?,?,?,?, NOW())");
                $stmt->execute([
                    $player['LeagueId'],
                    $player['UserId'],
                    $player['TeamId'],
                    $activeSeason,
                    $player['FirstName'],
                    $player['LastName'],
                    $player['Nickname'],
                    $player['JerseyNumber'],
                    $player['ArchetypeId'],
                    $player['Height'],
                    $player['Weight']
                ]);

                // Get the ID of the newly inserted player
                $newPlayerId = $this->pdo->lastInsertId();

                // Fetch the newly inserted player
                $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
                $stmt->execute([$newPlayerId]);
                $player = $stmt->fetch(PDO::FETCH_ASSOC);

                $status = "Player Created Successfully";

            }
            
            return [
                'status' => $status,
                'player' => [
                    'PlayerId' => $player['PlayerId'],
                    'UserId' => $player['UserId'],
                    'TeamId' => $player['TeamId'],
                    'LeagueId' => $player['LeagueId'],
                    'SeasonCreated' => $player['SeasonCreated'],
                    'FirstName' => $player['FirstName'],
                    'LastName' => $player['LastName'],
                    'Nickname' => $player['Nickname'],
                    'JerseyNumber' => $player['JerseyNumber'],
                    'ArchetypeId' => $player['ArchetypeId'],
                    'Height' => $player['Height'],
                    'Weight' => $player['Weight']
                ]
            ];

        } catch (PDOException $e) {
            return ['error' => 'Failed to upsert player' . $e];
        } finally {
            // Close the connection
            $this->pdo = null;
        }

    }

}

?>