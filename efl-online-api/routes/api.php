<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS from all origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: *");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../controllers/HelloController.php';
require_once __DIR__ . '/../controllers/EFLOAuthController.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../controllers/PlayerController.php';
require_once __DIR__ . '/../controllers/LeagueController.php';
require_once __DIR__ . '/../controllers/ApproverController.php';

$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];


$pdo = Database::getInstance($requestUri)->getConnection();
$helloController = new HelloController($pdo);
$eflOAuthController = new EFLOAuthController($pdo);
$userController = new UserController($pdo);
$playerController = new PlayerController($pdo);
$leagueController = new LeagueController($pdo);
$approverController = new ApproverController($pdo);


$headers = getallheaders();
$eflo_access_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

switch ($requestUri) {
    

    case '/EFLOAuth/GenerateAuthToken':
        if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($eflOAuthController->generateAuthToken($input));
        }
        break;

    case '/EFLOAuth/ValidateAuthToken':
        if ($requestMethod == 'GET') {
            echo json_encode($eflOAuthController->validateAuthToken($eflo_access_token, true));
        }
        break;
        
    case '/User':
        if ($requestMethod == 'GET') {
            echo json_encode($userController->getUsers($eflo_access_token));
        }
        break;

    //GET A SINGLE EFLO MEMBER
    case preg_match('/\/User\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'GET':
        $userId = $matches[1];
        echo json_encode($userController->getUserById($eflo_access_token, $userId));
        break;

    //PUT - UPDATE A SINGLE EFLO MEMBER
    case preg_match('/\/User\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'PUT':
        $userId = $matches[1];
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode($userController->updateUser($eflo_access_token, $userId, $input['eflo_member']));
        break;
            

    case '/User/ActiveUser':
        if ($requestMethod == 'POST') {
            echo json_encode($userController->getActiveUser($eflo_access_token));
        }
        break;


    case '/Player':
        if ($requestMethod == 'GET') {
            echo json_encode($playerController->GetPlayers());
        }
        else if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($playerController->UpsertPlayer($eflo_access_token, $input['player']));

        }
        break;
        
    case '/Player/Active':
        if ($requestMethod == 'GET') {
            echo json_encode($playerController->GetActivePlayers());
        }
        break;

        
    case '/Player/ActiveUser':
        if ($requestMethod == 'GET') {
            echo json_encode($playerController->GetActiveUserPlayers($eflo_access_token));
        }
        break;

    case preg_match('/\/Player\/UserPlayers\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'GET':
        $userId = $matches[1];
        
        echo json_encode($playerController->GetAllUserPlayers($eflo_access_token, $userId));        
        break;
        
    case preg_match('/\/Player\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'GET':
        $playerId = $matches[1];
        echo json_encode($playerController->GetPlayerDetail($playerId));
        break;

    case preg_match('/\/Player\/PlayerUpdates\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'GET':
        $playerId = $matches[1];
        
        echo json_encode($playerController->GetPlayerUpdatesByPlayer($eflo_access_token, $playerId));        
        break;


        case '/Player/PointTaskSubmission':
            if ($requestMethod == 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $pointTaskSubmission = $input['point_task_submission'];
                echo json_encode($playerController->UpsertPointTaskSubmission($eflo_access_token, $pointTaskSubmission));
            }
            break;
            
    case preg_match('/\/Player\/DeletePointTaskSubmission\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'DELETE':
        $pointTaskSubmissionId = $matches[1];
        
        echo json_encode($playerController->DeletePointTaskSubmission($eflo_access_token, $pointTaskSubmissionId));        
        break;

    case '/Player/AttributeUpdate':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['attribute_update'])) {
            $attributeUpdate = $input['attribute_update'];
            $result = $playerController->UpsertAttributeUpdate($eflo_access_token, $attributeUpdate);
            echo json_encode($result);
        } else {
            echo json_encode(['error' => 'Invalid input']);
        }
        break;

    case preg_match('/\/Player\/Retire\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'POST':
        $playerId = $matches[1];
        echo json_encode($playerController->RetirePlayer($eflo_access_token, $playerId));
        
        break;

        
            
    case '/Archetypes/AllArchetypes':
        if ($requestMethod == 'GET') {
            echo json_encode($playerController->GetArchetypes());
        }
        break;

        case '/PointTaskType':
            if ($requestMethod == 'GET') {
                echo json_encode($playerController->GetPointTaskTypes());
            }
            break;

            
            case '/Team':
                if ($requestMethod == 'GET') {
                    echo json_encode($leagueController->GetTeams());
                }
                break;

                
            
    case preg_match('/\/Team\/([a-f0-9\-]+)/', $requestUri, $matches) && $requestMethod === 'GET':
        $teamId = $matches[1];
        
        echo json_encode($leagueController->GetTeamDetails($teamId));        
        break;

    case '/Player/AssignTeam':
        if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($playerController->AssignToTeam($eflo_access_token, $input['playerId'], $input['teamId']));
        }
        break;

            
    case '/Approver/PendingUpdates':
        if ($requestMethod == 'GET') {
            echo json_encode($approverController->GetPendingPlayerUpdates($eflo_access_token));
        }
        break;
    case '/Approver/ProcessPointTaskSubmission':
        if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($approverController->ProcessPointTaskSubmission($eflo_access_token, $input));
        }
        break;
            
    case '/Approver/ProcessAttributeUpdate':
        if ($requestMethod == 'POST') {
            $input = json_decode(file_get_contents('php://input'), true);
            echo json_encode($approverController->ProcessAttributeUpdate($eflo_access_token, $input));
        }
        break;
    
    default:
        echo json_encode(['message' => 'Invalid route']);
        break;
}
?>