<?php
// PlayerController handles player-related API endpoints

require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload for dependencies
require_once __DIR__ . '/EFLOAuthController.php';
require_once __DIR__ . '/UserController.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class PlayerController {
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

    // Get all players (snapshot)
    public function GetPlayers() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM PlayerSnapshot");
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $players;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch players'];
        } finally {
            $this->pdo = null;
        }
    }

    // Get all active (not retired) players
    public function GetActivePlayers() {
        try {
            $stmt = $this->pdo->query("SELECT * FROM PlayerSnapshot Where RetiredDate IS NULL");
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $players;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players'];
        } finally {
            $this->pdo = null;
        }
    }

    // Get all active players for the current user (by access token)
    public function GetActiveUserPlayers($eflo_access_token, $close_conn = true) {
        try {
            // Validate token
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);
            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }

            // Get user from token
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }

            // Get all active players for this user
            $stmt = $this->pdo->prepare("SELECT * FROM Player Where RetiredDate IS NULL AND UserId = ?");
            $stmt->execute([$user['UserId']]);
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get player details for each player
            $playerDetails = [];
            foreach ($players as $player) {
                $playerDetails[] = $this->GetPlayerDetail($player['PlayerId'], false);
            }

            return $playerDetails;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players for current user' . $e];
        } finally {
            if ($close_conn)
                $this->pdo = null;
        }
    }

    // Get all players for a specific user
    public function GetAllUserPlayers($eflo_access_token, $userId, $close_conn = true) {
        try {
            // Validate token
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);
            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }

            // Get user by userId
            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }

            // Get all players for this user
            $stmt = $this->pdo->prepare("SELECT * FROM Player Where UserId = ?");
            $stmt->execute([$user['UserId']]);
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get player details for each player
            $playerDetails = [];
            foreach ($players as $player) {
                $playerDetails[] = $this->GetPlayerDetail($player['PlayerId'], false);
            }

            return $playerDetails;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players for current user' . $e];
        } finally {
            if ($close_conn)
                $this->pdo = null;
        }
    }

    // Create or update a player
    public function UpsertPlayer($eflo_access_token, $player, $closeConn = true) {
        try {
            // Get league and season info
            $stmt = $this->pdo->prepare("SELECT * FROM League WHERE LeagueId = ?");
            $stmt->execute([$player['LeagueId']]);
            $activeLeague = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM Season WHERE SeasonEnd IS NULL LIMIT 1");
            $stmt->execute([]);
            $activeSeason = $stmt->fetch(PDO::FETCH_ASSOC);

            $existingPlayer = null;
            if ($player['PlayerId'] != null) {
                $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
                $stmt->execute([$player['PlayerId']]);
                $existingPlayer = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            if ($existingPlayer != null) {
                // Update existing player
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
            } else {
                // Create new player
                $stmt = $this->pdo->prepare("INSERT Player (LeagueId, UserId, SeasonCreated, FirstName, LastName, Nickname, JerseyNumber, ArchetypeId, Height, Weight, CreateDate) 
                    VALUES (?,?,?,?,?,?,?,?,?,?, NOW())");
                $stmt->execute([
                    $player['LeagueId'],
                    $player['UserId'],
                    $activeSeason['SeasonNo'],
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

                // Create initial point task for new player
                $pointTaskSubmission = [
                    "PointTaskSubmissionId" => null,
                    "UserId" => $player['UserId'],
                    "PointTaskTypeId" => 3,
                    "PlayerId" => $newPlayerId,
                    "ClaimedPoints" => $activeLeague['InitialTPE'],
                    "URL" => "",
                    "Notes" => "PlayerCreated",
                    "WeekEnding" => (new DateTime())->modify('next saturday')->format('Y-m-d')
                ];
                $pts = $this->UpsertPointTaskSubmission($eflo_access_token, $pointTaskSubmission, false);

                // Fetch the newly inserted player
                $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
                $stmt->execute([$newPlayerId]);
                $player = $stmt->fetch(PDO::FETCH_ASSOC);

                $status = "Player Created Successfully";
            }

            // Return player info
            return [
                'status' => $status,
                'player' => [
                    'PlayerId' => $player['PlayerId'],
                    'UserId' => $player['UserId'],
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
            if ($closeConn)
                $this->pdo = null;
        }
    }

    // Get detailed info for a player
    public function GetPlayerDetail($playerId, $closeConn = true) {
        try {
            if ($this->pdo === null) {
                throw new Exception('Database connection is not initialized.');
            }

            // Get player details
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerDetail WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($player == null) {
                return ['error' => 'Player not found.'];
            }

            // Get player TPE
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerTPE WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player_tpe = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get player stats
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerStats WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get team info
            $stmt = $this->pdo->prepare("SELECT * FROM Team WHERE TeamId = ? OR (? IS NULL AND Name = 'Free Agent')");
            $stmt->execute([$player['TeamId'], $player['TeamId']]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get team history
            $stmt = $this->pdo->prepare("SELECT * FROM TeamHistory WHERE PlayerId = ?
                ORDER BY ReleaseDate IS NULL DESC, ReleaseDate DESC, AssignDate DESC");
            $stmt->execute([$playerId]);
            $teamHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'player' => array_merge(
                    $player,
                    [
                        'tpe' => $player_tpe,
                        'stats' => $player_stats,
                        'team' => $team,
                        'teamHistory' => $teamHistory
                    ]
                )
            ];
        } catch (PDOException $e) {
            return ['error' => 'Failed to get player with provided player id' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Get or create a PlayerUpdate for a user and week ending.
     * Returns the PlayerUpdate and associated point task submissions and attribute updates.
     */
    public function GetPlayerUpdate($userId, $weekEnding, $playerId = null, $closeConn = true) {
        try {
            // Ensure weekEnding is a DateTime object and is a Saturday
            if (!($weekEnding instanceof DateTime)) {
                $weekEndingDate = new DateTime($weekEnding);
            } else {
                $weekEndingDate = $weekEnding;
            }
            if ($weekEndingDate->format('N') != 6) {
                $weekEndingDate->modify('next saturday');
            }
            $weekEnding = $weekEndingDate->format('Y-m-d');

            // Try to fetch the PlayerUpdate for this user and week
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate WHERE UserId = ? AND WeekEnding = ?");
            $stmt->execute([$userId, $weekEnding]);
            $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);

            // If not found, create a new PlayerUpdate
            if ($playerUpdate == null) {
                $stmt = $this->pdo->prepare("INSERT PlayerUpdate (UserId, CreateDate, WeekEnding) VALUES (?, NOW(), ?)");
                $stmt->execute([$userId, $weekEnding]);
                $newPlayerUpdateId = $this->pdo->lastInsertId();

                $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate WHERE UserId = ? AND WeekEnding = ?");
                $stmt->execute([$userId, $weekEnding]);
                $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            // Fetch point task submissions for this update
            $stmt = $this->pdo->prepare(
                "SELECT pts.*, ptt.Name, ptt.IsUncapped, ptt.Frequency
                 FROM PointTaskSubmission pts
                 LEFT JOIN PointTaskType ptt ON pts.PointTaskTypeId = ptt.PointTaskTypeId
                 WHERE PlayerUpdateId = ? AND (PlayerId = ? OR PlayerId IS NULL)"
            );
            $stmt->execute([$playerUpdate['PlayerUpdateId'], $playerId]);
            $pointTaskSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch attribute updates for this update
            $stmt = $this->pdo->prepare(
                "SELECT au.*, a.Code, a.Name
                 FROM AttributeUpdate au
                 LEFT JOIN Attribute a on au.AttributeId = a.AttributeId
                 WHERE PlayerUpdateId = ? AND PlayerId = ?"
            );
            $stmt->execute([$playerUpdate['PlayerUpdateId'], $playerId]);
            $attributeUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return combined update info
            return [
                'playerUpdate' => array_merge(
                    $playerUpdate,
                    [
                        'pointTaskSubmissions' => $pointTaskSubmissions,
                        'attributeUpdates' => $attributeUpdates,
                    ]
                )
            ];
        } catch (PDOException $e) {
            return ['error' => 'Failed to Get or Create Player Update' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Get all PlayerUpdates for a player (by access token and playerId)
     */
    public function GetPlayerUpdatesByPlayer($eflo_access_token, $playerId, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);
            if ($user == null) {
                return ['error' => 'User not found'];
            }

            // Get player info
            $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);

            // Get all PlayerUpdates for this user
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate WHERE UserId = ? AND WeekEnding >= ? AND (? IS NULL OR WeekEnding <= ?)");
            $stmt->execute([$player['UserId'], $player['CreateDate'], $player['RetiredDate'], $player['RetiredDate']]);

            $playerUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Build details for each update
            $playerUpdateDetails = [];
            foreach ($playerUpdates as $playerUpdate) {
                $playerUpdateDetails[] = $this->GetPlayerUpdate(
                    $player['UserId'],
                    $playerUpdate['WeekEnding'],
                    $playerId,
                    false
                );
            }
            return $playerUpdateDetails;
        } catch (PDOException $e) {
            return ['error' => 'Error getting player updates ' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Create or update a PointTaskSubmission for a player update.
     */
    public function UpsertPointTaskSubmission($eflo_access_token, $pointTaskSubmission, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);
            if ($user == null) {
                return ['error' => 'User not found'];
            }
            if (!isset($pointTaskSubmission['WeekEnding'])) {
                return ['error' => 'Week Ending not provided'];
            }

            // Get the active player update for this week/player
            $playerUpdate = $this->GetPlayerUpdate(
                $user['eflo_member']['Id'],
                $pointTaskSubmission['WeekEnding'],
                $pointTaskSubmission['PlayerId'],
                false
            );
            if ($playerUpdate == null) {
                return ['error' => 'Player Update could not be found or created for Week Ending ' . $pointTaskSubmission['WeekEnding'] . ' and Player Id ' . $pointTaskSubmission['PlayerId']];
            }

            $pointTaskSubmissionId = $pointTaskSubmission['PointTaskSubmissionId'];

            // Check max points for this PointTaskType
            $stmt = $this->pdo->prepare("SELECT * FROM PointTaskType WHERE PointTaskTypeId = ?");
            $stmt->execute([$pointTaskSubmission['PointTaskTypeId']]);
            $maxPoints = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($maxPoints == null) {
                return ['error' => 'Point Task could not be found'];
            }
            if ($maxPoints['MaxPoints'] < $pointTaskSubmission['ClaimedPoints']) {
                return ['error' => 'Cannot claim more than the max point task amount : ' . $maxPoints['MaxPoints']];
            }

            // Update or insert logic
            if ($pointTaskSubmissionId != null) {
                // Update existing point task submission if not approved
                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                $stmt->execute([$pointTaskSubmissionId]);
                $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($pts != null) {
                    if ($pts['ApprovedDate'] == null) {
                        $stmt = $this->pdo->prepare(
                            "UPDATE PointTaskSubmission SET PointTaskTypeId = ?, ClaimedPoints = ?, URL = ?, Notes = ?, RejectedDate = NULL, ApproverId = NULL WHERE PointTaskSubmissionId = ?"
                        );
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $pointTaskSubmission['ClaimedPoints'],
                            $pointTaskSubmission['URL'],
                            $pointTaskSubmission['Notes'],
                            $pointTaskSubmissionId
                        ]);
                        // Return the updated submission
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                        $stmt->execute([$pointTaskSubmissionId]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);
                        return $pts;
                    } else {
                        return ['error' => 'Point Task Submission with the given id is approved and cannot be edited.'];
                    }
                } else {
                    return ['error' => 'Point Task Submission with the given id could not be found.'];
                }
            } else {
                // Insert new point task submission
                $stmt = $this->pdo->prepare("SELECT SeasonNo FROM Season WHERE SeasonEnd IS NULL LIMIT 1");
                $stmt->execute([]);
                $activeSeason = $stmt->fetch(PDO::FETCH_ASSOC)['SeasonNo'];

                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskType WHERE PointTaskTypeId = ?");
                $stmt->execute([$pointTaskSubmission['PointTaskTypeId']]);
                $PTType = $stmt->fetch(PDO::FETCH_ASSOC);

                // Frequency checks
                switch ($PTType['Frequency']) {
                    case "CAREER":
                        if ($pointTaskSubmission['PlayerId'] == null) {
                            return ['error' => 'CAREER Point Tasks must be assigned to a player.'];
                        }
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND PlayerId = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $pointTaskSubmission['PlayerId']
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($pts != null) {
                            return ['error' => 'CAREER Point Tasks can only be created once per player.'];
                        }
                        break;
                    case "SEASONAL":
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND CreatedSeason = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $activeSeason
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($pts != null) {
                            return ['error' => 'SEASONAL Point Tasks can only be created once per season.'];
                        }
                        break;
                    case "WEEKLY":
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND PlayerUpdateId = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $playerUpdate['playerUpdate']['PlayerUpdateId']
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($pts != null) {
                            return ['error' => 'WEEKLY Point Tasks can only be created once per update.'];
                        }
                        break;
                    default:
                        break;
                }

                // Insert the new submission
                $stmt = $this->pdo->prepare(
                    "INSERT INTO PointTaskSubmission (PointTaskTypeId, PlayerUpdateId, PlayerId, ClaimedPoints, URL, Notes, CreateDate, CreatedSeason, ApprovedDate, RejectedDate, ApproverId)
                     VALUES (?,?,?,?,?,?,NOW(), ?, ?, NULL, NULL)"
                );
                $stmt->execute([
                    $pointTaskSubmission['PointTaskTypeId'],
                    $playerUpdate['playerUpdate']['PlayerUpdateId'],
                    $pointTaskSubmission['PlayerId'],
                    $pointTaskSubmission['ClaimedPoints'],
                    $pointTaskSubmission['URL'],
                    $pointTaskSubmission['Notes'],
                    $activeSeason,
                    ($pointTaskSubmission['PointTaskTypeId'] == 3 ? date('Y-m-d H:i:s') : null)
                ]);
                $pointTaskSubmissionId = $this->pdo->lastInsertId();

                // Return the new submission
                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                $stmt->execute([$pointTaskSubmissionId]);
                $pts = $stmt->fetch(PDO::FETCH_ASSOC);
                return $pts;
            }
        } catch (PDOException $e) {
            return ['error' => 'Error Upserting the Point Task Submission ' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Delete a PointTaskSubmission if it belongs to the current user.
     */
    public function DeletePointTaskSubmission($eflo_access_token, $pointTaskSubmissionId, $closeConn = true) {
        try {
            // Check if the point task submission belongs to the current user
            $user = $this->userController->getActiveUser($eflo_access_token, false);
            if ($user == null) {
                return ['error' => 'User not found'];
            }

            $stmt = $this->pdo->prepare(
                "SELECT * FROM PointTaskSubmission pts
                 JOIN PlayerUpdate pu ON pts.PlayerUpdateId = pu.PlayerUpdateId
                 WHERE PointTaskSubmissionId = ? AND pu.UserId = ?"
            );
            $stmt->execute([
                $pointTaskSubmissionId,
                $user['eflo_member']['Id']
            ]);
            $pts = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($pts == null) {
                return ['error' => 'PTS not found or PTS does not belong to current user'];
            }

            // Delete the point task submission
            $stmt = $this->pdo->prepare("DELETE FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
            $stmt->execute([$pointTaskSubmissionId]);

            return ['Success' => 'Point Task Submission deleted'];
        } catch (PDOException $e) {
            return ['error' => 'Error Deleting the Point Task Submission ' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Create or update an AttributeUpdate for a player.
     */
    public function UpsertAttributeUpdate($eflo_access_token, $attributeUpdate, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);
            if ($user == null) {
                return ['error' => 'User not found'];
            }

            $player = $this->GetPlayerDetail($attributeUpdate['PlayerId'], false);
            if ($player == null) {
                return ['error' => 'Player not found'];
            }

            // Get the active player update for this player
            $now = new DateTime();
            $playerUpdate = $this->GetPlayerUpdate($user['eflo_member']['Id'], $now, $player['player']['PlayerId'], false);
            if ($playerUpdate == null) {
                return ['error' => 'Player Update not found'];
            }

            // Get the attributeId from the provided code
            $stmt = $this->pdo->prepare("SELECT * FROM Attribute WHERE Code = ?");
            $stmt->execute([$attributeUpdate['Code']]);
            $attr = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($attr == null) {
                return ['error' => 'Attribute with given code could not be found.'];
            }

            // Check for pending attribute update for this player on a different playerUpdate
            $stmt = $this->pdo->prepare(
                "SELECT * FROM AttributeUpdate
                 WHERE AttributeId = ? AND PlayerUpdateId != ? AND PlayerId = ?
                 AND ApprovedDate IS NULL AND RejectedDate IS NULL"
            );
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId'],
                $player['player']['PlayerId']
            ]);
            $pending_au = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($pending_au != null) {
                return ['error' => 'An update to this attribute is pending. Attribute cannot be updated until previous updates are processed.'];
            }

            // Get the attributeUpdate if it exists in this player update
            $stmt = $this->pdo->prepare(
                "SELECT * FROM AttributeUpdate WHERE AttributeId = ? AND PlayerUpdateId = ? AND PlayerId = ? AND RejectedDate IS NULL"
            );
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId'],
                $player['player']['PlayerId']
            ]);
            $au = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($au != null && $au['ApprovedDate'] != null) {
                return ['error' => 'Attribute Update with the given id is approved and cannot be edited.'];
            }

            // If PointCost is 0, delete the attribute update if it exists
            if ($attributeUpdate['PointCost'] == 0) {
                if ($au != null) {
                    $stmt = $this->pdo->prepare("DELETE FROM AttributeUpdate WHERE AttributeUpdateId = ?");
                    $stmt->execute([$au['AttributeUpdateId']]);
                    return ['warning' => 'Attribute update for ' . $attributeUpdate['Code'] . ' reset to 0'];
                } else {
                    return ['warning' => 'Attribute should not be updated with no cost'];
                }
            }

            if ($au != null) {
                // Update existing AttributeUpdate
                $stmt = $this->pdo->prepare(
                    "UPDATE AttributeUpdate SET ValueFrom = ?, ValueTo = ?, PointCost = ? WHERE AttributeId = ? AND PlayerUpdateId = ?"
                );
                $stmt->execute([
                    $attributeUpdate['ValueFrom'],
                    $attributeUpdate['ValueTo'],
                    $attributeUpdate['PointCost'],
                    $attr['AttributeId'],
                    $playerUpdate['playerUpdate']['PlayerUpdateId']
                ]);
            } else {
                // Insert new AttributeUpdate
                $stmt = $this->pdo->prepare(
                    "INSERT INTO AttributeUpdate (AttributeId, PlayerUpdateId, PlayerId, PointCost, ValueFrom, ValueTo, CreateDate, ApprovedDate, RejectedDate, ApproverId)
                     VALUES (?,?,?,?,?,?, NOW(), NULL, NULL, NULL)"
                );
                $stmt->execute([
                    $attr['AttributeId'],
                    $playerUpdate['playerUpdate']['PlayerUpdateId'],
                    $attributeUpdate['PlayerId'],
                    $attributeUpdate['PointCost'],
                    $attributeUpdate['ValueFrom'],
                    $attributeUpdate['ValueTo']
                ]);
            }

            // Fetch and return the updated or inserted AttributeUpdate
            $stmt = $this->pdo->prepare(
                "SELECT * FROM AttributeUpdate WHERE AttributeId = ? AND PlayerUpdateId = ? AND RejectedDate IS NULL"
            );
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId']
            ]);
            $au = $stmt->fetch(PDO::FETCH_ASSOC);

            return $au;
        } catch (PDOException $e) {
            return ['error' => 'Failed to insert or update attribute' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Retire a player if the current user owns the player.
     */
    public function RetirePlayer($eflo_access_token, $playerId, $closeConn = true) {
        try {
            // Validate access token
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);
            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }

            // Get user from token
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }

            // Get player info
            $stmt = $this->pdo->prepare("SELECT * FROM Player WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);

            // Check if player belongs to user
            if ($player['UserId'] != $user['UserId']) {
                return ['error' => 'This player does not belong to the active user and cannot be retired'];
            }

            // Check if player is already retired
            if ($player['RetiredDate'] != null) {
                return ['error' => 'Player is already retired'];
            }

            // Update RetiredDate to now
            $stmt = $this->pdo->prepare("UPDATE Player SET RetiredDate = NOW() WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player['RetireDate'] = date('Y-m-d H:i:s');

            return $player;
        } catch (PDOException $e) {
            return ['error' => 'Failed to retire player' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Get all archetypes.
     */
    public function GetArchetypes($closeConn = true) {
        try {
            $stmt = $this->pdo->query("SELECT * FROM Archetype");
            $archetypes = $stmt->fetchAll(PDO::FETCH_ASSOC);


            // Get archetype caps
            $archetypeCaps = [];
            foreach ($archetypes as $archetype) {
                $archetypeCaps[] = $this->GetArchetypeCaps($archetype);
            }

            return $archetypeCaps;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch archetypes' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Get attribute caps for a given archetype.
     *
     * @param array $archetype The archetype data array.
     * @return array The archetype data merged with its attribute caps.
     */
    public function GetArchetypeCaps($archetype){
        $stmt = $this->pdo->prepare(" SELECT `Code`, `Name`, `MaxValue`
                                    FROM ArchetypeAttributeCap ac
                                    INNER JOIN Attribute att on ac.AttributeId = att.AttributeId 
                                    WHERE ArchetypeId = ?");
        $stmt->execute([$archetype['ArchetypeId']]);
        $archetypeCaps = $stmt->fetchAll(PDO::FETCH_ASSOC);

         return array_merge(
            $archetype,
            [
                'StatCaps' => $archetypeCaps
            ]
        );
    }

    /**
     * Get all point task types.
     */
    public function GetPointTaskTypes($closeConn = true) {
        try {
            $stmt = $this->pdo->query("SELECT * FROM PointTaskType");
            $types = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $types;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch point task types' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

    /**
     * Assign a player to a team (requires GM or Admin permissions).
     */
    public function AssignToTeam($eflo_access_token, $playerId, $teamId, $closeConn = true) {
        try {
            // Validate access token
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);
            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }

            // Get user from token
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }

            // Require GM or Admin permissions
            $stmt = $this->pdo->prepare(
                "SELECT * FROM SecurityGroupMembership sgm
                 JOIN SecurityGroup sg ON sgm.GroupId = sg.GroupId
                 WHERE sg.Name IN ('General Manager','Admin') AND UserId = ? LIMIT 1"
            );
            $stmt->execute([$token['UserId']]);
            $perm = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$perm) {
                return ['error' => 'User does not have required permissions for this action'];
            }

            // Check for active team assignment and release if changing teams
            $stmt = $this->pdo->prepare("SELECT * FROM TeamAssignment WHERE PlayerId = ? AND ReleaseDate IS NULL LIMIT 1");
            $stmt->execute([$playerId]);
            $team_assn = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($team_assn && $team_assn['TeamId'] != $teamId) {
                $stmt = $this->pdo->prepare("UPDATE TeamAssignment SET ReleaseDate = NOW() WHERE PlayerId = ? AND ReleaseDate IS NULL");
                $stmt->execute([$playerId]);
            }

            // Add new team assignment if not assigned or changing teams
            if (!$team_assn || $team_assn['TeamId'] != $teamId) {
                $stmt = $this->pdo->prepare(
                    "INSERT INTO TeamAssignment (PlayerId, TeamId, AssignDate, ReleaseDate)
                     VALUES (?, ?, NOW(), NULL)"
                );
                $stmt->execute([$playerId, $teamId]);
                $newTeamAssnId = $this->pdo->lastInsertId();

                // Fetch the newly inserted team assignment
                $stmt = $this->pdo->prepare("SELECT * FROM TeamAssignment WHERE TeamAssignmentId = ?");
                $stmt->execute([$newTeamAssnId]);
                $team_assn = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            return $team_assn;
        } catch (PDOException $e) {
            return ['error' => 'Failed to assign player to team' . $e];
        } finally {
            if ($closeConn)
                $this->pdo = null;
        }
    }

}

?>