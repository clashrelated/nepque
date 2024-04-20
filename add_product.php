<?php
    session_start();
    if (!isset($_SESSION['admin'])) {
        header("Location: admin_login.php");
        exit();
    }

    // Include database connection and other necessary files
    require_once 'db_connection.php';

    // Retrieve product details from the form
    $product_name = $_POST['product_name'];
    $price = $_POST['price'];
    // Add more fields as needed

    // Insert the new product into the database
    $sql = "INSERT INTO products (product_name, price) VALUES ('$product_name', '$price')";
    // Execute the SQL query

    // Redirect to admin panel or display success message
?>
