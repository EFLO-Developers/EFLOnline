<?php
// ApproverController handles approval and rejection of player updates and point tasks

require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload for dependencies
require_once __DIR__ . '/EFLOAuthController.php';
require_once __DIR__ . '/UserController.php';

use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

use Ramsey\Uuid\Uuid;
use GuzzleHttp\Client;

class ApproverController {
    private $pdo;
    private $client;
    private $eflOAuthController;
    private $userController;

    // Constructor initializes PDO, HTTP client, and controllers
    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->client = new Client();
        $this->eflOAuthController = new EFLOAuthController($pdo); // Initialize EFLOAuthController
        $this->userController = new UserController($pdo); // Initialize UserController
    }

    // Helper: Convert ISO 8601 datetime to MySQL datetime format
    private function convertToMySQLDateTime($isoDateTime) {
        if ($isoDateTime) {
            $dateTime = new DateTime($isoDateTime);
            return $dateTime->format('Y-m-d H:i:s');
        }
        return null;
    }

    // Get all pending player updates for approval
    public function GetPendingPlayerUpdates($eflo_access_token, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if ($user == null) {
                return ['error' => 'User not found'];
            }

            // TODO: Check if user is in security groups Admin or Approver

            // Fetch all pending player updates
            $stmt = $this->pdo->prepare("SELECT * FROM PendingPlayerUpdates ORDER BY WeekEnding ASC, UserId, PlayerId");
            $stmt->execute();
            $pendingPlayerUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Combine results into one JSON payload
            $pendingPlayerUpdateDetails = [];
            foreach ($pendingPlayerUpdates as $pendingPlayerUpdate) {
                $pendingPlayerUpdateDetails[] = $this->GetPendingUpdateDetail(
                    $pendingPlayerUpdate['PlayerUpdateId'],
                    $pendingPlayerUpdate['PlayerId'],
                    false
                );
            }

            return $pendingPlayerUpdateDetails;
        } catch (PDOException $e) {
            return ['error' => 'Failed to fetch Pending Player Updates' . $e];
        } finally {
            // Close the connection if requested
            if ($closeConn)
                $this->pdo = null;
        }
    }

    // Get details for a specific pending player update
    private function GetPendingUpdateDetail($playerUpdateId, $playerId, $closeConn = true) {
        try {
            // Ensure PDO connection is initialized
            if ($this->pdo === null) {
                throw new Exception('Database connection is not initialized.');
            }

            // Fetch the pending player update
            $stmt = $this->pdo->prepare("SELECT * FROM PendingPlayerUpdates WHERE PlayerUpdateId = ? AND PlayerId = ? LIMIT 1");
            $stmt->execute([$playerUpdateId, $playerId]);
            $playerUpdate = $stmt->fetch(PDO::FETCH_ASSOC);

            // Fetch point task submissions for this update
            $stmt = $this->pdo->prepare(
                "SELECT pts.*, ptt.Name, ptt.IsUncapped, ptt.Frequency, p.FirstName, p.LastName, p.Position, p.ArchetypeName
                 FROM PointTaskSubmission pts 
                 LEFT JOIN PointTaskType ptt ON pts.PointTaskTypeId = ptt.PointTaskTypeId 
                 LEFT JOIN PlayerDetail p on pts.PlayerId = p.PlayerId
                 WHERE PlayerUpdateId = ?
                   AND (pts.PlayerId = ? OR pts.PlayerId IS NULL)
                   AND ApprovedDate IS NULL AND RejectedDate IS NULL"
            );
            $stmt->execute([$playerUpdateId, $playerId]);
            $pointTaskSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Fetch attribute updates for this update
            $stmt = $this->pdo->prepare(
                "SELECT au.* , a.Code, a.Name, p.FirstName, p.LastName, p.Position, p.ArchetypeName
                 FROM AttributeUpdate au
                 LEFT JOIN Attribute a on au.AttributeId = a.AttributeId
                 LEFT JOIN PlayerDetail p on au.PlayerId = p.PlayerId
                 WHERE PlayerUpdateId = ? 
                   AND au.PlayerId = ?
                   AND ApprovedDate IS NULL AND RejectedDate IS NULL"
            );
            $stmt->execute([$playerUpdateId, $playerId]);
            $attributeUpdates = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Return combined details
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
            return ['error' => 'Failed to fetch Pending Player Update' . $e];
        } finally {
            // Close the connection if requested
            if ($closeConn)
                $this->pdo = null;
        }
    }

    // Approve or reject a point task submission
    public function ProcessPointTaskSubmission($eflo_access_token, $pointTaskSubmission, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if ($user == null) {
                return ['error' => 'User not found'];
            }

            // Convert ISO 8601 datetime to MySQL datetime format
            $approvedDate = $this->convertToMySQLDateTime($pointTaskSubmission['ApprovedDate']);
            $rejectedDate = $this->convertToMySQLDateTime($pointTaskSubmission['RejectedDate']);

            // Update the point task submission
            $stmt = $this->pdo->prepare(
                "UPDATE PointTaskSubmission SET ApprovedDate = ?, RejectedDate = ?, RejectReason = ?, ApproverId = ? WHERE PointTaskSubmissionId = ?"
            );
            $stmt->execute([
                $approvedDate,
                $rejectedDate,
                $pointTaskSubmission['RejectReason'],
                $user['eflo_member']['Id'],
                $pointTaskSubmission['PointTaskSubmissionId']
            ]);

            // Fetch and return the updated submission
            $stmt = $this->pdo->prepare("SELECT * FROM PointTaskSubmission WHERE PointTaskSubmissionId = ?");
            $stmt->execute([$pointTaskSubmission['PointTaskSubmissionId']]);
            $pts = $stmt->fetch(PDO::FETCH_ASSOC);

            return $pts;
        } catch (PDOException $e) {
            return ['error' => 'Failed to process Point Task Submission' . $e];
        } finally {
            // Close the connection if requested
            if ($closeConn)
                $this->pdo = null;
        }
    }

    // Approve or reject an attribute update
    public function ProcessAttributeUpdate($eflo_access_token, $attributeUpdate, $closeConn = true) {
        try {
            $user = $this->userController->getActiveUser($eflo_access_token, false);

            if ($user == null) {
                return ['error' => 'User not found'];
            }

            // Update the attribute update record
            $stmt = $this->pdo->prepare(
                "UPDATE AttributeUpdate SET ApprovedDate = ?, RejectedDate = ?, RejectReason = ?, ApproverId = ? WHERE AttributeUpdateId = ?"
            );
            $stmt->execute([
                $attributeUpdate['ApprovedDate'],
                $attributeUpdate['RejectedDate'],
                $attributeUpdate['RejectReason'],
                $user['eflo_member']['Id'],
                $attributeUpdate['AttributeUpdateId']
            ]);

            // Fetch and return the updated attribute update
            $stmt = $this->pdo->prepare("SELECT * FROM AttributeUpdate WHERE AttributeUpdateId  = ?");
            $stmt->execute([$attributeUpdate['AttributeUpdateId']]);
            $au = $stmt->fetch(PDO::FETCH_ASSOC);

            return $au;
        } catch (PDOException $e) {
            return ['error' => 'Failed to process Attribute Updates' . $e];
        } finally {
            // Close the connection if requested
            if ($closeConn)
                $this->pdo = null;
        }
    }
}