<?php
include 'cors.php';
include 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_POST['activity_id'])) {
        echo json_encode(["status" => 400, "message" => "Missing activity ID"]);
        exit;
    }

    $activity_id = intval($_POST['activity_id']); // Sanitize input

    $sql = "DELETE FROM activity WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $activity_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Activity deleted successfully"]);
    } else {
        echo json_encode(["status" => 500, "message" => "Failed to delete activity"]);
    }
} else {
    echo json_encode(["status" => 405, "message" => "Method Not Allowed"]);
}