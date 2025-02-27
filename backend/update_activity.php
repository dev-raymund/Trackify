<?php

include 'cors.php';
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $activityId = $_POST['activity_id'];
    $description = $_POST['description'];
    $amount = $_POST['amount'];
    $category = $_POST['category'];
    $type = $_POST['type'];

    // Check if the activity exists
    $checkQuery = "SELECT id FROM activity WHERE id = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("i", $activityId);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows == 0) {
        echo json_encode(["status" => 404, "message" => "Activity not found"]);
    } else {
        // Update vehicle information
        $query = "UPDATE activity SET description = ?, amount = ?, category = ?, type = ?, price = ? WHERE id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssssi", $description, $amount, $category, $type, $vehicleId);

        if ($stmt->execute()) {
            echo json_encode(["status" => 200, "message" => "Activity updated successfully"]);
        } else {
            echo json_encode(["status" => 500, "message" => "Error: " . $stmt->error]);
        }
    }

    $stmt->close();
}
