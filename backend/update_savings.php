<?php
include 'cors.php';
include 'connection.php';

$user_id = $_POST['user_id'];
$goal_id = $_POST['goal_id'];
$amount = $_POST['amount'];

// Insert as an "expense" in activity table
$insertExpense = "INSERT INTO activity (description, amount, category, type, user_id, timestamp) 
                  VALUES ('Savings Transfer', ?, 'Savings', 'expense', ?, NOW())";
$stmt1 = $conn->prepare($insertExpense);
$stmt1->bind_param("di", $amount, $user_id);
$success1 = $stmt1->execute();

// Update savings goal
$updateSavings = "UPDATE savings_goals SET saved_amount = saved_amount + ? WHERE id = ?";
$stmt2 = $conn->prepare($updateSavings);
$stmt2->bind_param("di", $amount, $goal_id);
$success2 = $stmt2->execute();

if ($success1 && $success2) {
    echo json_encode(["status" => 200, "message" => "Amount successfully added to savings"]);
} else {
    echo json_encode(["status" => 500, "message" => "Error processing savings"]);
}

$conn->close();