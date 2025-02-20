<?php

include 'cors.php';
include 'connection.php';

if(isset($_GET['savings_goal_id'])) {

    $savingsGoalId = $_GET['savings_goal_id'];

    // Secure the query using prepared statements
    $stmt = $conn->prepare("SELECT * FROM savings_goals WHERE id = ?");
    $stmt->bind_param("i", $savingsGoalId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $savings_goal = $result->fetch_assoc();
        echo json_encode(['status' => 200, 'data' => $savings_goal]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Savings Goal not found']);
    }

    $stmt->close();
    $conn->close();

} elseif($_GET['user_id']) {

    $userId = $_GET['user_id'];

    if ($userId) {
        $stmt = $conn->prepare("SELECT * FROM savings_goals WHERE user_id = ?");
        $stmt->bind_param("s", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
    
        $goals = [];
        $totalSaved = 0;
        $categorizedSavings = [];

        while ($row = $result->fetch_assoc()) {

            $goals[] = $row;
            $totalSaved += $row['saved_amount'];
        }

        // Fetch weekly savings
        $weeklySql = "
            SELECT 
                SUM(saved_amount) AS total 
            FROM savings_goals 
            WHERE user_id = '$userId' 
            AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
        $weeklyResult = $conn->query($weeklySql);

        $weeklySavings = 0;
        if ($weeklyResult->num_rows > 0) {
            $weeklyRow = $weeklyResult->fetch_assoc();
            $weeklySavings = $weeklyRow['total'];
        }
        // Fetch monthly savings
        $monthlySql = "
            SELECT 
                SUM(saved_amount) AS total 
            FROM savings_goals 
            WHERE user_id = '$userId' 
            AND MONTH(created_at) = MONTH(CURDATE()) 
            AND YEAR(created_at) = YEAR(CURDATE())";
        $monthlyResult = $conn->query($monthlySql);

        $monthlySavings = 0;
        if ($monthlyResult->num_rows > 0) {
            $monthlyRow = $monthlyResult->fetch_assoc();
            $monthlySavings = $monthlyRow['total'];
        }

        $currentBalance = $totalSaved;
    
        echo json_encode([
            'status' => 200, 
            'goals' => $goals,
            'weekly_savings' => $weeklySavings,
            'monthly_savings' => $monthlySavings,
        ]);
    } else {
        echo json_encode(['status' => 400, 'message' => 'Invalid user ID']);
    }
}

