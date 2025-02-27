<?php

include 'cors.php';
include 'connection.php';

if(isset($_GET['budget_id'])) {

    $budgetId = $_GET['budget_id'];

    // Secure the query using prepared statements
    $stmt = $conn->prepare("SELECT * FROM budgets WHERE id = ?");
    $stmt->bind_param("i", $budgetId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $budget = $result->fetch_assoc();
        echo json_encode(['status' => 200, 'data' => $budget]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Budget not found']);
    }

    $stmt->close();
    $conn->close();

} elseif($_GET['user_id']) {

    $userId = $_GET['user_id'];

    $sql = "SELECT id, category, budget_limit FROM budgets WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $budgets = [];
    while ($row = $result->fetch_assoc()) {
        $budgets[] = $row;
    }
    
    echo json_encode([
        'status' => 200,
        'budgets' => $budgets
    ]);
}


