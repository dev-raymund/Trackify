<?php
include 'cors.php';
include 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (!isset($_POST['savings_goal_id'])) {
        echo json_encode(["status" => 400, "message" => "Missing Savings Goal ID"]);
        exit;
    }

    $savings_goal_id = intval($_POST['savings_goal_id']); // Sanitize input

    $sql = "DELETE FROM savings_goals WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $savings_goal_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Savings Goal deleted successfully"]);
    } else {
        echo json_encode(["status" => 500, "message" => "Failed to delete Savings Goal"]);
    }
} else {
    echo json_encode(["status" => 405, "message" => "Method Not Allowed"]);
}