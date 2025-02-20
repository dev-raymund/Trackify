<?php
include 'cors.php';
include 'connection.php';

if(isset($_GET['activity_id'])) {

    $activityId = $_GET['activity_id'];

    // Secure the query using prepared statements
    $stmt = $conn->prepare("SELECT * FROM activity WHERE id = ?");
    $stmt->bind_param("i", $activityId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $activity = $result->fetch_assoc();
        echo json_encode(['status' => 200, 'data' => $activity]);
    } else {
        echo json_encode(['status' => 404, 'message' => 'Activity not found']);
    }

    $stmt->close();
    $conn->close();

} elseif($_GET['user_id']) {

    $userId = $_GET['user_id'] ?? '';

    if (!$userId) {
        echo json_encode(['status' => 400, 'message' => 'User ID is required']);
        exit;
    }

    // Fetch all activities
    $sql = "SELECT * FROM activity WHERE user_id = '$userId' ORDER BY timestamp DESC";
    $result = $conn->query($sql);

    $data = [];
    $totalIncome = 0;
    $totalExpense = 0;
    $categorizedSpending = [];

    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
        
        if ($row['type'] === 'income') {
            $totalIncome += $row['amount'];
        } else {
            $totalExpense += $row['amount'];

            // Categorized spending
            $category = $row['category'];
            if (!isset($categorizedSpending[$category])) {
                $categorizedSpending[$category] = 0;
            }
            $categorizedSpending[$category] += $row['amount'];
        }
    }

    // Fetch weekly income & expense
    $weeklySql = "
        SELECT 
            type, 
            SUM(amount) AS total 
        FROM activity 
        WHERE user_id = '$userId' 
        AND YEARWEEK(timestamp, 1) = YEARWEEK(CURDATE(), 1) 
        GROUP BY type";
    $weeklyResult = $conn->query($weeklySql);

    $weeklyIncome = 0;
    $weeklyExpense = 0;
    while ($row = $weeklyResult->fetch_assoc()) {
        if ($row['type'] === 'income') {
            $weeklyIncome = $row['total'];
        } else {
            $weeklyExpense = $row['total'];
        }
    }

    // Fetch monthly income & expense
    $monthlySql = "
        SELECT 
            type, 
            SUM(amount) AS total 
        FROM activity 
        WHERE user_id = '$userId' 
        AND MONTH(timestamp) = MONTH(CURDATE()) 
        AND YEAR(timestamp) = YEAR(CURDATE()) 
        GROUP BY type";
    $monthlyResult = $conn->query($monthlySql);

    $monthlyIncome = 0;
    $monthlyExpense = 0;
    while ($row = $monthlyResult->fetch_assoc()) {
        if ($row['type'] === 'income') {
            $monthlyIncome = $row['total'];
        } else {
            $monthlyExpense = $row['total'];
        }
    }

    $currentBalance = $totalIncome - $totalExpense;

    $startOfWeek = date("Y-m-d", strtotime("monday this week"));
    $endOfWeek = date("Y-m-d", strtotime("sunday this week"));

    $currentMonth = date("F");

    echo json_encode([
        'status' => 200,
        'data' => $data,
        'total_income' => $totalIncome,
        'total_expense' => $totalExpense,
        'current_balance' => $currentBalance,
        'categorized_spending' => $categorizedSpending,
        'weekly_income' => $weeklyIncome,
        'weekly_expense' => $weeklyExpense,
        'current_week_start' => $startOfWeek,
        'current_week_end' => $endOfWeek,
        'monthly_income' => $monthlyIncome,
        'monthly_expense' => $monthlyExpense,
        'current_month' => $currentMonth
    ]);

    $conn->close();
}