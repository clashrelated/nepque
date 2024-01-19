<?php
$servername = "localhost";
$username = "cyrusflp_couponuser";
$password = "ijxKZ64a3k6vYJL";
$dbname = "cyrusflp_coupon";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
	die("Connection failed: " . $conn->connect_error);
}

$image = $_FILES['image']['name'];
$name = $_POST['name'];
$code = $_POST['code'];

// Move uploaded file to a designated directory
move_uploaded_file($_FILES['image']['tmp_name'], "uploads/" . $image);

// Insert coupon data into the database
$sql = "INSERT INTO coupons (image, name, code) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $image, $name, $code);
$stmt->execute();

// Close the database connection
$stmt->close();
$conn->close();

// Redirect to the homepage
header("Location: index.php");
exit();
?>