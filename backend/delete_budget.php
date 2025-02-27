<?php
include 'cors.php';
include 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id = $_POST['id'];

    $sql = "DELETE FROM budgets WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(["status" => 200, "message" => "Budget deleted successfully"]);
    } else {
        echo json_encode(["status" => 500, "message" => "Failed to delete budget"]);
    }
}

