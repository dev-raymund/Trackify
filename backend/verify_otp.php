<?php
include 'cors.php';
include 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $otp = $_POST['otp'];
    $new_password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    // Check if OTP is correct
    $stmt = $conn->prepare("SELECT id, reset_expires FROM users WHERE email = ? AND reset_token = ?");
    $stmt->bind_param("ss", $email, $otp);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $reset_expires = strtotime($row['reset_expires']);
        $current_time = time();

        // Check if OTP is expired
        if ($reset_expires < $current_time) {
            echo json_encode(["status" => "error", "message" => "OTP expired."]);
            exit;
        }

        // OTP is correct and valid, proceed with password reset
        $stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ?");
        $stmt->bind_param("ss", $new_password, $email);
        $stmt->execute();

        echo json_encode(["status" => "success", "message" => "Password reset successful!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid OTP!"]);
    }
}