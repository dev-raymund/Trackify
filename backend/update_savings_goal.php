<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $savings_goal_id = $_POST['savings_goal_id'];
    $goal_name = $_POST['goal_name'];
    $goal_amount = $_POST['goal_amount'];
    $goal_end_date = $_POST['goal_end_date'];

    // Check if the budget exists
    $checkQuery = "SELECT id FROM savings_goals WHERE id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $savings_goal_id);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        echo json_encode(["status" => 404, "message" => "Savings Goal not found"]);
    } else {
        // Update budget information
        $query = "UPDATE savings_goals SET goal_name = ?, target_amount = ?, end_date = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("sssi", $goal_name, $goal_amount, $goal_end_date, $savings_goal_id);

        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Savings Goal updated successfully"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}