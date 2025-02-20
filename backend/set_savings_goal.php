<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'];
    $goalName = $_POST['goal_name'];
    $targetAmount = floatval($_POST['target_amount']);
    $endDate = $_POST['end_date'];

    if ($userId && $goalName && $targetAmount > 0) {
        // Insert new savings goal
        $stmt = $conn->prepare("INSERT INTO savings_goals (user_id, goal_name, target_amount, end_date) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssds", $userId, $goalName, $targetAmount, $endDate);

        if ($stmt->execute()) {
            echo json_encode(['status' => 200, 'message' => 'Savings goal added successfully']);
        } else {
            echo json_encode(['status' => 500, 'message' => 'Database error']);
        }
    } else {
        echo json_encode(['status' => 400, 'message' => 'Invalid data']);
    }
}