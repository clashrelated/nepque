<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            min-height: 100vh; 
        }

        nav {
            background-color: #333;
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        nav a {
            color: white;
            text-decoration: none;
        }

        nav a[href="login.html"] {
            margin-right: 15px;
        }

        main {
            flex: 1; /* Takes remaining vertical space */
            display: flex;
            justify-content: center;
            align-items: center;
        }

        section {
            text-align: justify;
            max-width: 1000px;
            margin: 20px;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 50px;
        }
        .imagetop img {
            width: 990px; 
            max-width: 990px; 
            height: 290px; 
            border-radius: 20px; 
        }

        
    </style>
</head>
<body>
    
    <!-- Nav Bar -->
    <nav>
    
        <div>
            <a href="index.php">NepQue</a>
        </div>
        
        <div class="nav-right">
            <?php
            if (isset($_SESSION["user_email"])) {
                // User is logged in, then show this
                echo '<a href="submit.php">Submit Coupon</a>';
                echo '<form method="post"><button type="submit" name="logout">Logout</button></form>';
            } else {
                // This will be shown if no user or admin is logged in 
                echo '<a href="login.html">Login</a>';
                echo '<a href="signup.html">Sign-Up</a>';
            }
            ?>
        </div>
    </nav>

    <!-- About Me Section -->
    <main>
        <section>
        <div class="imagetop">
            <img src="nepque.jpg" alt="nepque" align="center">
        </div>
            <h2 align="center">About NepQue</h2>
            
            <p>
                NepQue is an online coupon and deals sharing website that provides coupon codes for various platforms like Daraz, Sastodeal, Khalti, eSewa, etc. 
                We collect coupon codes from websites, social media, and emails from these platforms.
                Online shopping is on the rise in Nepal, with the use of digital wallets and other platforms increasing rapidly. 
                From a few online platforms a few years ago, Nepal now boasts hundreds of them, spanning shopping, ride-sharing, online food ordering, and more.
                People are missing out a lot of savings by not using free coupons provided by these platforms.
                Sometimes these platforms share the coupon via email, sometimes on their social media and sometimes via push notifications, and for a normal user it’s a lot of hassle to visit these media sites to find a simple coupon code.
            </p>
        </section>
    </main>
</body>
</html>
