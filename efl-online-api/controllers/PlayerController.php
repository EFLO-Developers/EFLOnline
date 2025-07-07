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



class PlayerController {
    private $pdo;
    private $client;
    private $eflOAuthController;
    private $userController;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo); // Initialize EFLOAuthController
        $this->userController = new UserController($pdo); // Initialize UserController
    }

    public function GetPlayers(){
        try {
            $stmt = $this->pdo->query("SELECT * FROM PlayerSnapshot");
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
            $stmt = $this->pdo->query("SELECT * FROM PlayerSnapshot Where RetiredDate IS NULL");
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $players;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players'];
        } finally {
            // Close the connection
            $this->pdo = null;
        }
    }

    public function GetActiveUserPlayers($eflo_access_token, $close_conn = true){
        try{
            
            // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }
                
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }
            



            $stmt = $this->pdo->prepare("SELECT * FROM Player Where RetiredDate IS NULL AND UserId = ?");
            $stmt->execute([
                $user['UserId']
            ]);
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Combine results into one JSON payload
            $playerDetails = [];
            foreach ($players as $player) {
                $playerDetails[] = $this->GetPlayerDetail($player['PlayerId'], false);
            }

            // Return all players
            return $playerDetails;


        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players for current user' . $e];
        } finally {
            // Close the connection
            if($close_conn)
                $this->pdo = null;
        }
    }
    
    public function GetAllUserPlayers($eflo_access_token, $userId, $close_conn = true){
        try{
            
            // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }
                
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }
            



            $stmt = $this->pdo->prepare("SELECT * FROM Player Where UserId = ?");
            $stmt->execute([
                $user['UserId']
            ]);
            $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Combine results into one JSON payload
            $playerDetails = [];
            foreach ($players as $player) {
                $playerDetails[] = $this->GetPlayerDetail($player['PlayerId'], false);
            }

            // Return all players
            return $playerDetails;


        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch active players for current user' . $e];
        } finally {
            // Close the connection
            if($close_conn)
                $this->pdo = null;
        }
    }

    public function UpsertPlayer($eflo_access_token, $player, $closeConn = true){

        try {
            

            //GET USER ID FROM THE TOKEN

            //CHECK IF USER ALREADY HAS A PLAYER WITH THE GIVEN ARCHETYPE CATEGORY

            $stmt = $this->pdo->prepare("SELECT * FROM League WHERE LeagueId = ?");
            $stmt->execute([
                $player['LeagueId'],
            ]);
            $activeLeague = $stmt->fetch(PDO::FETCH_ASSOC);

            
            $stmt = $this->pdo->prepare("SELECT * FROM Season WHERE SeasonEnd IS NULL LIMIT 1");
            $stmt->execute([
            ]);
            $activeSeason = $stmt->fetch(PDO::FETCH_ASSOC);



            

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
                $stmt = $this->pdo->prepare("INSERT Player      (LeagueId, UserId, SeasonCreated, FirstName, LastName, Nickname, JerseyNumber, ArchetypeId, Height, Weight, CreateDate) 
                                                        VALUES  (?,?,?,?,?,?,?,?,?,?, NOW())");
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

                //create a new point task giving the initial amount of tpe for the new player
                //Get the initial PT id
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
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }

    }

    public function GetPlayerDetail($playerId, $closeConn = true){
        try {
            
            // Ensure PDO connection is initialized
            if ($this->pdo === null) {
                throw new Exception('Database connection is not initialized.');
            }

            // Fetch the newly inserted player
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerDetail WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);

            if($player == null){
                return ['error' => 'Player not found.'];
            }

            //Get player stats array
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerTPE WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player_tpe = $stmt->fetch(PDO::FETCH_ASSOC);

            //Get player stats array
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerStats WHERE PlayerId = ?");
            $stmt->execute([$playerId]);
            $player_stats = $stmt->fetchAll(PDO::FETCH_ASSOC);

            //Get player team info
            $stmt = $this->pdo->prepare("SELECT * FROM Team WHERE TeamId = ? OR (? IS NULL AND Name = 'Free Agent')");
            $stmt->execute([
                $player['TeamId'],
                $player['TeamId']
            ]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);

            
            //Get player team history
            $stmt = $this->pdo->prepare("SELECT * FROM TeamHistory WHERE PlayerId = ?
                                            ORDER BY ReleaseDate IS NULL DESC, ReleaseDate DESC, AssignDate DESC");
            $stmt->execute([
                $playerId
            ]);
            $teamHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);



            //get player updates array
            //get point task submissions


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
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }
    }

    public function GetPlayerUpdate($userId, $weekEnding, $playerId = null, $closeConn = true){
        try{
        
            //check if week ending date is a saturday, if not find the nearest saturday
            // check if week ending is a dateTime object else Convert weekEnding to DateTime object
            if (!($weekEnding instanceof DateTime)) {
                $weekEndingDate = new DateTime($weekEnding);
            } else {
                $weekEndingDate = $weekEnding;
            }

            // Check if the week ending date is a Saturday
            if ($weekEndingDate->format('N') != 6) {
                // Find the nearest Saturday
                $weekEndingDate->modify('next saturday');
            }

            // Now $weekEndingDate is the nearest Saturday
            $weekEnding = $weekEndingDate->format('Y-m-d');

            //check there is a player update associated to the given week ending
            $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate WHERE UserId = ? AND WeekEnding = ?");
            $stmt->execute([
                $userId,
                $weekEnding
            ]);
            $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);


            if($playerUpdate == null){
                //if there is no player update for this week, create a new one and return in
                $stmt = $this->pdo->prepare("INSERT PlayerUpdate    (UserId, CreateDate, WeekEnding) 
                                                            VALUES  (?, NOW(), ?)");
                $stmt->execute([
                    $userId,
                    $weekEnding
                ]);

                // Get the ID of the newly inserted player
                $newPlayerUpdateId = $this->pdo->lastInsertId();

                $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate WHERE UserId = ? AND WeekEnding = ?");
                $stmt->execute([
                    $userId,
                    $weekEnding
                ]);
                $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);
            }

            


            $stmt = $this->pdo->prepare("SELECT pts.*, ptt.Name, ptt.IsUncapped, ptt.Frequency
                                            FROM PointTaskSubmission pts 
                                            LEFT JOIN PointTaskType ptt ON pts.PointTaskTypeId = ptt.PointTaskTypeId 
                                                WHERE PlayerUpdateId = ? AND (PlayerId = ? OR PlayerId IS NULL)");
            $stmt->execute([
                $playerUpdate['PlayerUpdateId'],
                $playerId
            ]);
            $pointTaskSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            
            $stmt = $this->pdo->prepare("SELECT au.* , a.Code, a.Name
                                            FROM AttributeUpdate au
                                                LEFT JOIN Attribute a on au.AttributeId = a.AttributeId
                                                WHERE PlayerUpdateId = ? AND PlayerId = ?");
            $stmt->execute([
                $playerUpdate['PlayerUpdateId'],
                $playerId
            ]);
            $attributeUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);



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
        } finally{
            
            if($closeConn)
                $this->pdo = null;
        }

    }

    public function GetPlayerUpdatesByPlayer($eflo_access_token, $playerId, $closeConn = true){
        try{
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if($user == null){
               return ['error' => 'User not found'];
            }

            $stmt = $this->pdo->prepare("SELECT * FROM Player Where PlayerId = ?");
            $stmt->execute([
                $playerId
            ]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);


            $stmt = $this->pdo->prepare("SELECT * FROM PlayerUpdate Where UserId = ?");
            $stmt->execute([
                $player['UserId']
            ]);
            $playerUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);


            
            // Combine results into one JSON payload
            $playerUpdateDetails = [];
            foreach ($playerUpdates as $playerUpdate) {
                $playerUpdateDetails[] = $this->GetPlayerUpdate(   
                    $player['UserId'],
                    $playerUpdate['WeekEnding'], 
                    $playerId,  false);
            }

            // Return all playerUpdates
            return $playerUpdateDetails;



        } catch (PDOException $e) {
            return ['error' => 'Error getting player updates ' . $e];
        } finally {
            // Close the connection
            if($closeConn)
            $this->pdo = null;
        }
    }

    public function UpsertPointTaskSubmission($eflo_access_token, $pointTaskSubmission, $closeConn = true){

        try{
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if($user == null){
               return ['error' => 'User not found'];
            }
            
            //check if pointtasksubmission includeds weekending            
            if (!isset($pointTaskSubmission['WeekEnding'])) {
                return ['error' => 'Week Ending not provided'];
            }

            //get the active player update
            $playerUpdate = $this->GetPlayerUpdate($user['eflo_member']['Id'], 
                                                    $pointTaskSubmission['WeekEnding'], 
                                                    $pointTaskSubmission['PlayerId'], false);


            if($playerUpdate == null){
                return ['error' => 'Player Update could not be found or created for Week Ending' . $pointTaskSubmission['WeekEnding'] .  ' and Plauyer Id' . $pointTaskSubmission['PlayerId'] ];
            }

            $pointTaskSubmissionId = $pointTaskSubmission['PointTaskSubmissionId'];

            //check if claimed points is less than or equal to the MaxPoints for the PointTaskId
            $stmt = $this->pdo->prepare("SELECT * FROM PointTaskType WHERE PointTaskTypeId = ?");
            $stmt->execute([
                $pointTaskSubmission['PointTaskTypeId']
            ]);
            $maxPoints = $stmt->fetch(PDO::FETCH_ASSOC);


            if($maxPoints == null){
                return ['error' => 'Point Task could not be found' ];
            }
            
            if ($maxPoints['MaxPoints'] < $pointTaskSubmission['ClaimedPoints']){
                return ['error' => 'Cannot claim more than the max point task amount : ' . $maxPoints['MaxPoints'] ];
            }

            //Determine if it is an Update or INsert
            if($pointTaskSubmissionId != null){
                //Get the existing point task, check if it exists
                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                $stmt->execute([$pointTaskSubmissionId]);
                $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                if($pts != null){
                    if ($pts['ApprovedDate'] == null){
                        

                            //UPDATE A POINT TASK
                            $stmt = $this->pdo->prepare("UPDATE PointTaskSubmission SET PointTaskTypeId = ?, ClaimedPoints = ?, URL = ?, Notes = ?, RejectedDate = NULL, ApproverId = NULL WHERE PointTaskSubmissionId = ?");
                            $stmt->execute([
                                            $pointTaskSubmission['PointTaskTypeId'],
                                            $pointTaskSubmission['ClaimedPoints'],
                                            $pointTaskSubmission['URL'],
                                            $pointTaskSubmission['Notes'],
                                            $pointTaskSubmissionId
                                        ]);
                            $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                            //return the newly updated point task submission
                            $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                            $stmt->execute([$pointTaskSubmissionId]);
                            $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                            return $pts;
                            
                    } else{
                        return ['error' => 'Point Task Submission with the given id is approved and cannot be edited.'];
                    }
                } else{
                    return ['error' => 'Point Task Submission with the given id could not be found.'];
                }
            } else {


                //get current Active Season
                $stmt = $this->pdo->prepare("SELECT SeasonNo FROM Season WHERE SeasonEnd IS NULL LIMIT 1");
                $stmt->execute([]);
                $activeSeason = $stmt->fetch(PDO::FETCH_ASSOC)['SeasonNo'];



                //get the point task from the PointTaskTypeId
                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskType WHERE PointTaskTypeId = ?");
                $stmt->execute([
                   $pointTaskSubmission['PointTaskTypeId']
                ]);
                $PTType = $stmt->fetch(PDO::FETCH_ASSOC);

                //check the FrequencyType
                switch($PTType['Frequency']){
                    
                    //CASE CAREER (PlayerId != null) - Check if there are any Submissions of this type for the active season
                    case "CAREER":
                        if($pointTaskSubmission['PlayerId'] == null){
                            return ['error' => 'CAREER Point Tasks must be assigned to a player.'];
                        }

                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND PlayerId = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $pointTaskSubmission['PlayerId']
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                        if($pts != null){
                            return ['error' => 'CAREER Point Tasks can only be created once per player.'];
                        }

                        break;
                    //CASE SEASONAL - Check if there are any Submissions of this type for the active season
                    case "SEASONAL":
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND CreatedSeason = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $activeSeason
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                        if($pts != null){
                            return ['error' => 'SEASONAL Point Tasks can only be created once per season.'];
                        }
                        break;
                    //CASE WEEKLY - Check if there are any submissions of this type for the active PlayerUpdate
                    case "WEEKLY":
                        $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskTypeId = ? AND PlayerUpdateId = ? AND RejectedDate IS NULL");
                        $stmt->execute([
                            $pointTaskSubmission['PointTaskTypeId'],
                            $playerUpdate['playerUpdate']['PlayerUpdateId']
                        ]);
                        $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                        if($pts != null){
                            return ['error' => 'WEEKLY Point Tasks can only be created once per update.'];
                        }
                        break;  
                    //CASE UNLIMITED (default)
                    default:
                        break;
                }


                //INSERT A NEW POINT TASK SUBMISSION FOR REVIEW
                $stmt = $this->pdo->prepare("INSERT INTO PointTaskSubmission   (PointTaskTypeId, PlayerUpdateId, PlayerId, ClaimedPoints, URL, Notes, CreateDate, CreatedSeason, ApprovedDate, RejectedDate, ApproverId)
                                                                        VALUES (?,?,?,?,?,?,NOW(), ?, ?, NULL, NULL)");
                $stmt->execute([
                                $pointTaskSubmission['PointTaskTypeId'],
                                $playerUpdate['playerUpdate']['PlayerUpdateId'],
                                $pointTaskSubmission['PlayerId'],
                                $pointTaskSubmission['ClaimedPoints'],
                                $pointTaskSubmission['URL'],
                                $pointTaskSubmission['Notes'],
                                $activeSeason,
                                ($pointTaskSubmission['PointTaskTypeId'] == 3 ? date('Y-m-d H:i:s') : null) //if Point Task is PlayerCreated, then auto approve
                            ]);
                $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                // Get the ID of the newly inserted point task submission
                $pointTaskSubmissionId = $this->pdo->lastInsertId();

                //return the newly updated point task submission
                $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
                $stmt->execute([$pointTaskSubmissionId]);
                $pts = $stmt->fetch(PDO::FETCH_ASSOC);

                return $pts;
            }

        } catch (PDOException $e) {
            return ['error' => 'Error Upserting the Point Task Submission ' . $e];
        } finally {
            // Close the connection
            if($closeConn)
            $this->pdo = null;
        }


    }

    public function DeletePointTaskSubmission($eflo_access_token, $pointTaskSubmissionId, $closeConn = true){
        try{
            //check if the point task submission belongs to the current user
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if($user == null){
               return ['error' => 'User not found'];
            }

            $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission pts 
                                            JOIN PlayerUpdate pu on pts.PlayerUpdateId = pu.PlayerUpdateId 
                                                WHERE PointTaskSubmissionId = ?
                                                    AND pu.UserId = ?");
            $stmt->execute([
                $pointTaskSubmissionId,
                $user['eflo_member']['Id']
            ]);
            $pts = $stmt->fetch(PDO::FETCH_ASSOC);

            if($pts == null){
                return ['error' => 'PTS not found or PTS does not belong to current user'];
            }

            //delete the point task submission            
            $stmt = $this->pdo->prepare("DELETE FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
            $stmt->execute([
                $pointTaskSubmissionId
            ]);
            
            return ['Success' => 'Point Task Submission deleted'];


        } catch (PDOException $e) {
            return ['error' => 'Error Deleting the Point Task Submission ' . $e];
        } finally {
            // Close the connection
            if($closeConn)
            $this->pdo = null;
        }
    }

    public function UpsertAttributeUpdate($eflo_access_token, $attributeUpdate, $closeConn = true){
        try{

             $user = $this->userController->getActiveUser($eflo_access_token, false);

             if($user == null){
                return ['error' => 'User not found'];
             }
             
             $player = $this->GetPlayerDetail($attributeUpdate['PlayerId'], false);

             if($player == null){
                return ['error' => 'Player not found'];
             }

             //get the active player update
             $now = new DateTime();

             $playerUpdate = $this->GetPlayerUpdate($user['eflo_member']['Id'], $now, $player['player']['PlayerId'] , false);

             if($playerUpdate == null){
                return ['error' => 'Player Update not found'];
             }

             //get the player details
            //get the attributeId from the provided code
            $stmt = $this->pdo->prepare("SELECT * FROM Attribute WHERE Code = ?");
            $stmt->execute([
                $attributeUpdate['Code']
            ]);
            $attr = $stmt->fetch(PDO::FETCH_ASSOC);


            if($attr == null){
                return ['error' => 'Attribute wth given code could not be found.'];
            }


            //check if there is already a pending attribute update for this player on a different playerUpdate, reject if there is
            $stmt = $this->pdo->prepare("SELECT * FROM AttributeUpdate 
                                            WHERE AttributeId = ? AND PlayerUpdateId != ? AND PlayerId = ? 
                                                AND ApprovedDate IS NULL AND RejectedDate IS NULL");
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId'],
                $player['player']['PlayerId']
            ]);
            $pending_au = $stmt->fetch(PDO::FETCH_ASSOC);

            if($pending_au != null){
                return ['error' => 'An update to this attribute is pending. Attribute cannot be updated until previous updates are processed.'];
            }

             //get the attributeUpdate if it exists in this player update
            $stmt = $this->pdo->prepare("SELECT * FROM AttributeUpdate WHERE AttributeId = ? AND PlayerUpdateId = ? AND PlayerId = ? AND RejectedDate IS NULL");
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId'],
                $player['player']['PlayerId']
            ]);
            $au = $stmt->fetch(PDO::FETCH_ASSOC);

            
            if($au != null && $au['ApprovedDate'] != null){
                return ['error' => 'Attribute Update with the given id is approved and cannot be edited.'];
            }

            


            //check if the attribute update has already been submitted and the incoming update is different from the one we already have

             //update 
             //if($player['player']['tpe']['BankedTPE'] < $attributeUpdate['PointCost']){
             //   return ['error' => 'Attribute cost is greater than Banked TPE : ' . $player['player']['tpe']['BankedTPE'] . ' | ' . $attributeUpdate['PointCost']  . ' | ' . $au['PointCost']];
             //}


             if ($attributeUpdate['PointCost'] == 0){
                if($au != null){
                    //DELETE AttributeUpdate
                    $stmt = $this->pdo->prepare("DELETE FROM AttributeUpdate WHERE AttributeUpdateId = ?");
                    $stmt->execute([
                        $au['AttributeUpdateId']
                    ]);
                    $au = $stmt->fetch(PDO::FETCH_ASSOC);

                    return ['warning' => 'Attribute update for' . $attributeUpdate['Code'] . ' reset to 0'];
                }
                else{
                    return ['warning' => 'Attribute should not be updated with no cost'];
                }
             }
             

            
             if($au != null){
                //UPDATE AttributeUpdate
                $stmt = $this->pdo->prepare("UPDATE AttributeUpdate SET ValueFrom = ?, ValueTo = ?, PointCost = ? WHERE AttributeId = ? AND PlayerUpdateId = ?");
                $stmt->execute([
                    $attributeUpdate['ValueFrom'],
                    $attributeUpdate['ValueTo'],
                    $attributeUpdate['PointCost'],
                    $attr['AttributeId'],
                    $playerUpdate['playerUpdate']['PlayerUpdateId']
                ]);
                $au = $stmt->fetch(PDO::FETCH_ASSOC);

             }
             else{
                //INSERT AttributeUpdate
                $stmt = $this->pdo->prepare("INSERT INTO AttributeUpdate (AttributeId, PlayerUpdateId, PlayerId, PointCost, ValueFrom, ValueTo, CreateDate, ApprovedDate, RejectedDate, ApproverId)
                                                                    VALUES (?,?,?,?,?,?, NOW(), NULL, NULL, NULL)");
                $stmt->execute([
                    $attr['AttributeId'],
                    $playerUpdate['playerUpdate']['PlayerUpdateId'],
                    $attributeUpdate['PlayerId'],
                    $attributeUpdate['PointCost'],
                    $attributeUpdate['ValueFrom'],
                    $attributeUpdate['ValueTo']
                ]);
                $au = $stmt->fetch(PDO::FETCH_ASSOC);

             }

             
             //get the attributeUpdate if it exists in this player update
            $stmt = $this->pdo->prepare("SELECT * FROM AttributeUpdate WHERE AttributeId = ? AND PlayerUpdateId = ? AND RejectedDate IS NULL");
            $stmt->execute([
                $attr['AttributeId'],
                $playerUpdate['playerUpdate']['PlayerUpdateId']
            ]);
            $au = $stmt->fetch(PDO::FETCH_ASSOC);

            return $au;


        } catch (PDOException $e) {
            return ['error' => 'Failed to insert or update attribute' . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }


    }

    public function RetirePlayer($eflo_access_token, $playerId, $closeConn = true){
        try{
            // Use the eflo_access_token to check AuthTokens if there is an active token with that TokenId
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }
                
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }
            
            $stmt = $this->pdo->prepare("SELECT * FROM Player Where PlayerId = ?");
            $stmt->execute([
                $playerId
            ]);
            $player = $stmt->fetch(PDO::FETCH_ASSOC);

            //check if player belongs to user
            if($player['UserId'] != $user['UserId']){

                return ['error' => 'This player does not belong to the active user and cannot be retired'];
            }


            //check if player is already retired
            if($player['RetiredDate'] != null){
                
                return ['error' => 'Player is already retired'];
            }

            //update RetireDate = now
            $stmt = $this->pdo->prepare("UPDATE Player SET RetiredDate = NOW() Where PlayerId = ?");
            $stmt->execute([
                $playerId
            ]);

            $player['RetireDate'] = date('Y-m-d H:i:s');

            return $player;
        } catch (PDOException $e) {
            return ['error' => 'Failed to retire player' . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }
    }

    public function GetArchetypes($closeConn = true){
        try {
            $stmt = $this->pdo->query("SELECT * FROM Archetype");
            $archetypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $archetypes;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch archetypes' . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }
    }

    public function GetPointTaskTypes($closeConn = true){
        try {
            $stmt = $this->pdo->query("SELECT * FROM PointTaskType");
            $archetypes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $archetypes;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch point task types' . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }
    }

    public function AssignToTeam($eflo_access_token, $playerId, $teamId, $closeConn = true){
        try{
            //get user from token
            $tokenStatus = $this->eflOAuthController->validateAuthToken($eflo_access_token);

            if (!$tokenStatus['valid']) {
                return ['error' => 'Invalid or expired access token'];
            }
                
            $stmt = $this->pdo->prepare("SELECT * FROM AuthToken WHERE TokenId = ?");
            $stmt->execute([$eflo_access_token]);
            $token = $stmt->fetch(PDO::FETCH_ASSOC);

            $stmt = $this->pdo->prepare("SELECT * FROM User WHERE UserId = ?");
            $stmt->execute([$token['UserId']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return ['error' => 'User not found'];
            }
            
            //require gm or admin position to assign to team
            

            $stmt = $this->pdo->prepare("SELECT * FROM SecurityGroupMembership sgm JOIN SecurityGroup sg ON sgm.GroupId = sg.GroupId WHERE sg.Name IN ('General Manager','Admin') AND UserId = ? LIMIT 1");
            $stmt->execute([$token['UserId']]);
            $perm = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$perm){
                return ['error' => 'User does not have required permissions for this action'];
            }

            //check if there is an active team assignment
            //Set ReleaseDate = NOW() if found and TeamId is different
            
            $stmt = $this->pdo->prepare("SELECT * FROM TeamAssignment WHERE PlayerId = ? AND ReleaseDate IS NULL LIMIT 1");
            $stmt->execute([$playerId]);
            $team_assn = $stmt->fetch(PDO::FETCH_ASSOC);


            if($team_assn && $team_assn['TeamId'] != $teamId){
                $stmt = $this->pdo->prepare("UPDATE TeamAssignment SET ReleaseDate = NOW() Where PlayerId = ? AND ReleaseDate IS NULL");
                $stmt->execute([
                    $playerId
                ]);                
            }
                              
            if(!$team_assn || $team_assn['TeamId'] != $teamId){
                //Add new team assignement
                //AssignDate = NOW
                $stmt = $this->pdo->prepare("INSERT INTO TeamAssignment (PlayerId, TeamId, AssignDate, ReleaseDate)
                VALUES  (?,?,NOW(), NULL)");
                $stmt->execute([
                    $playerId,
                    $teamId
                ]);

                // Get the ID of the newly inserted player
                $newTeamAssnId = $this->pdo->lastInsertId();

                // Fetch the newly inserted team assn
                $stmt = $this->pdo->prepare("SELECT * FROM TeamAssignment WHERE TeamAssignmentId = ?");
                $stmt->execute([$newTeamAssnId]);
                $team_assn= $stmt->fetch(PDO::FETCH_ASSOC);
            }

            return $team_assn;


            //Return new TeamAssignment Object
        } catch (PDOException $e) {
            return ['error' => 'Failed to assign player to team' . $e];
        } finally {
            // Close the connection
            if($closeConn)
                $this->pdo = null;
        }

    }

}

?>