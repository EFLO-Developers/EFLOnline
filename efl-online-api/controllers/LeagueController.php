<?php
//require_once __DIR__ . '/../models/User.php';
//require_once __DIR__ . '/../models/AuthToken.php';

require_once __DIR__ . '/../vendor/autoload.php'; // Assuming you use Composer for UUID and Guzzle

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class LeagueController {
    private $pdo;
    private $client;
    private $playerController;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->playerController = new PlayerController($pdo); 
    }

    public function GetTeams() {
        //return team info and list of active players on team
        try {
            $stmt = $this->pdo->query("SELECT t.*, c.Name as ConferenceName, u.DiscordNick, u.ForumNick FROM Team t LEFT JOIN Conference c on t.ConferenceId = c.ConferenceId LEFT JOIN User u on t.GMUserId = u.UserId");
            $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $teams;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch teams'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    public function GetTeamDetails($teamId, $closeConn = true) {
        //return team info and list of active players on team
        try {
            $stmt = $this->pdo->prepare("SELECT t.*, c.Name as ConferenceName, u.DiscordNick, u.ForumNick 
                                            FROM Team t 
                                            LEFT JOIN Conference c on t.ConferenceId = c.ConferenceId 
                                            LEFT JOIN User u on t.GMUserId = u.UserId
                                                WHERE TeamId = ?");
            $stmt->execute([      
                $teamId
            ]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$team){
                return ['error' => 'Failed to fetch team'];
            }



            //get active players assigned to this teamId
            $stmt = $this->pdo->prepare("SELECT * FROM TeamAssignment WHERE ReleaseDate IS NULL AND TeamId = ?");
            $stmt->execute([      
                $teamId
            ]);
            $team_players = $stmt->fetchAll(PDO::FETCH_ASSOC);



            //get roster of player details
            // Combine results into one JSON payload
            $active_roster = [];
            foreach ($team_players as $player) {
                $active_roster[] = $this->playerController->GetPlayerDetail($player['PlayerId'], false);
            }


            return  array_merge(
                        $team,
                        [
                            'activeRoster' => $active_roster,                    
                        ]
                    );


            return $users;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch team with id ' . $teamId . " | " . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }
    }

}