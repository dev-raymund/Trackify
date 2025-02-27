<?php

include 'cors.php';

// Database connection
include 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_GET['step'] == 1) {

    $email = $_POST['email'];

    // Check if email already exists in the database
    $checkEmailQuery = "SELECT id FROM users WHERE email = '$email'";
    $result = $conn->query($checkEmailQuery);

    if ($result->num_rows > 0) {
        // Email exists, send error message
        echo json_encode(["status" => 400, "message" => "Email already exists."]);
        exit;
    }

    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    
    $query = "INSERT INTO users (first_name, last_name, email, password) VALUES ('$firstname', '$lastname', '$email', '$password')";
    if ($conn->query($query) === TRUE) {

        $user_id = $conn->insert_id;

        echo json_encode(["status" => 200, "message" => "Registration successful", "user_id" => $user_id]);
    } else {
        echo json_encode(["status" => 401, "message" => "Error: " . $conn->error]);
    }
}