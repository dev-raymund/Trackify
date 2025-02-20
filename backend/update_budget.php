<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $budgetId = $_POST['budget_id'];
    $budget_limit = $_POST['budget_limit'];

    // Check if the budget exists
    $checkQuery = "SELECT id FROM budgets WHERE id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $budgetId);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        echo json_encode(["status" => 404, "message" => "Budget not found"]);
    } else {
        // Update budget information
        $query = "UPDATE budgets SET budget_limit = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ss", $budget_limit, $budgetId);

        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Budget updated successfully"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}