<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'];
    $category = $_POST['category'];
    $budgetLimit = $_POST['budget_limit'];

    if ($userId && $category && $budgetLimit > 0) {
        // Check if the category already exists for the user
        $stmt = $conn->prepare("SELECT budget_limit FROM budgets WHERE user_id = ? AND category = ?");
        $stmt->bind_param("ss", $userId, $category);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            // If the budget already exists, sum the new amount with the existing one
            $newBudgetLimit = $row['budget_limit'] + $budgetLimit;
            $stmt = $conn->prepare("UPDATE budgets SET budget_limit = ? WHERE user_id = ? AND category = ?");
            $stmt->bind_param("dss", $newBudgetLimit, $userId, $category);
        } else {
            // Insert new budget if it doesn't exist
            $stmt = $conn->prepare("INSERT INTO budgets (user_id, category, budget_limit) VALUES (?, ?, ?)");
            $stmt->bind_param("ssd", $userId, $category, $budgetLimit);
        }

        if ($stmt->execute()) {
            echo json_encode(['status' => 200, 'message' => 'Budget updated successfully']);
        } else {
            echo json_encode(['status' => 500, 'message' => 'Database error']);
        }
    } else {
        echo json_encode(['status' => 400, 'message' => 'Invalid data']);
    }
}
