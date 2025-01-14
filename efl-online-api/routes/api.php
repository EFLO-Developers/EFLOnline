<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Allow CORS from all origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../controllers/HelloController.php';
require_once __DIR__ . '/../controllers/EFLOAuthController.php';
require_once __DIR__ . '/../controllers/UserController.php';

$pdo = $GLOBALS['pdo'];
$helloController = new HelloController($pdo);
$eflOAuthController = new EFLOAuthController($pdo);
$userController = new UserController($pdo);


$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

$headers = getallheaders();
$eflo_access_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

switch ($requestUri) {
    case '/Hello':
        if ($requestMethod == 'GET') {
            echo json_encode($helloController->helloWorld());
        } elseif ($requestMethod == 'POST') {
            //$input = json_decode(file_get_contents('php://input'), true);
            //echo json_encode($userController->createUser($input));
            echo json_encode(['message' => 'Invalid route']);
        }
        break;



        case '/EFLOAuth/GenerateAuthToken':
            if ($requestMethod == 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                echo json_encode($eflOAuthController->generateAuthToken($input));
            }
            break;
        case '/EFLOAuth/ValidateAuthToken':
            if ($requestMethod == 'POST') {
                echo json_encode($eflOAuthController->validateAuthToken($eflo_access_token));
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



    default:
        echo json_encode(['message' => 'Invalid route']);
        break;
}
?>