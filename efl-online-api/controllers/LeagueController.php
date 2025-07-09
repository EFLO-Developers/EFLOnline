<?php
// LeagueController handles league/team-related API endpoints

require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload for dependencies

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class LeagueController {
    private $pdo;
    private $client;
    private $playerController;

    // Constructor initializes PDO, HTTP client, and PlayerController
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->playerController = new PlayerController($pdo); 
    }

    // Get all active teams with conference and GM info
    public function GetTeams() {
        try {
            $stmt = $this->pdo->query(
                "SELECT t.*, c.Name as ConferenceName, u.DiscordNick, u.ForumNick 
                 FROM Team t 
                 LEFT JOIN Conference c on t.ConferenceId = c.ConferenceId 
                 LEFT JOIN User u on t.GMUserId = u.UserId
                 WHERE t.IsActive = 1
                 ORDER BY t.ConferenceId, t.SortOrder"
            );
            $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $teams;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch teams'];
        } finally {
            // Always close the connection
            $this->pdo = null;
        }
    }

    // Get details for a specific team, including active roster
    public function GetTeamDetails($teamId, $closeConn = true) {
        try {
            // Get team info with conference and GM details
            $stmt = $this->pdo->prepare(
                "SELECT t.*, c.Name as ConferenceName, u.DiscordNick, u.ForumNick 
                 FROM Team t 
                 LEFT JOIN Conference c on t.ConferenceId = c.ConferenceId 
                 LEFT JOIN User u on t.GMUserId = u.UserId
                 WHERE TeamId = ?"
            );
            $stmt->execute([$teamId]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$team) {
                return ['error' => 'Failed to fetch team'];
            }

            // Get all active players assigned to this team
            $stmt = $this->pdo->prepare(
                "SELECT * FROM TeamAssignment WHERE ReleaseDate IS NULL AND TeamId = ?"
            );
            $stmt->execute([$teamId]);
            $team_players = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Build the active roster with player details
            $active_roster = [];
            foreach ($team_players as $player) {
                $active_roster[] = $this->playerController->GetPlayerDetail($player['PlayerId'], false);
            }

            // Merge team info with active roster for response
            return array_merge(
                $team,
                [
                    'activeRoster' => $active_roster,                    
                ]
            );
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch team with id ' . $teamId . " | " . $e];
        } finally {
            // Optionally close the connection
            if ($closeConn) {
                $this->pdo = null;
            }
        }
    }
}