<?php
session_start();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee Tracking System - Login</title>
    <link rel="stylesheet" href="../assets/css/styles.css">
    <link rel="stylesheet" href="../assets/css/login.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
<header>
    <h1>Employee Tracking System</h1>
</header>
<div class="container">
    <h2>Login</h2>
    <form method="POST" id="login-form">
        <label for="role">Select Role:</label>
        <select id="role" name="role" required>
            <option value="User">User</option>
            <option value="Manager">Manager</option>
            <option value="HR">HR</option>
            <option value="Super Admin">Super Admin</option>
        </select>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
        <input type="submit" value="Login">
        <?php if (isset($_SESSION['error'])): ?>
            <p class="error"><?php echo $_SESSION['error']; unset($_SESSION['error']); ?></p>
        <?php endif; ?>
    </form>
</div>
<script src="../assets/js/login.js"></script>
</body>
</html>