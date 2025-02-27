<?php

include 'cors.php';

// Database connection
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $description = $_POST['description'];
    $amount = $_POST['amount'];
    $category = $_POST['category'];
    $type = $_POST['type']; // 'income' or 'expense'
    $userId = $_POST['user_id'];

    if ($userId && $category && $amount && $type) {

        // Insert new activity (expense or income)
        $stmt = $conn->prepare("INSERT INTO activity (description, amount, category, type, user_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $description, $amount, $category, $type, $userId);
        $stmt->execute();

        // If activity type is 'expense', check budget
        if ($type === 'expense') {
            // Get total spent in the category
            $sql = "SELECT SUM(amount) AS total_spent FROM activity WHERE user_id = ? AND category = ? AND type = 'expense'";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $userId, $category);
            $stmt->execute();
            $result = $stmt->get_result();
            $totalSpent = $result->fetch_assoc()['total_spent'] ?? 0;

            // Get budget for the category
            $sql = "SELECT budget_limit FROM budgets WHERE user_id = ? AND category = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ss", $userId, $category);
            $stmt->execute();
            $result = $stmt->get_result();
            $budgetLimit = $result->fetch_assoc()['budget_limit'] ?? 0;

            // Calculate remaining budget
            $remainingBudget = $budgetLimit - $totalSpent;

            // Return progress data
            echo json_encode([
                'status' => 200,
                'total_spent' => $totalSpent,
                'budget_limit' => $budgetLimit,
                'remaining_budget' => $remainingBudget,
                'message' => $remainingBudget <= 0 ? 'Budget exceeded!' : 'Budget under control',
                'type' => $type
            ]);
        } else {
            // If it's income, just return a success message
            echo json_encode([
                'status' => 200, 
                'message' => 'Income added successfully.',
                'type' => $type
            ]);
        }
    } else {
        echo json_encode(['status' => 400, 'message' => 'Invalid data']);
    }
}
