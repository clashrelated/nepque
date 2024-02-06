<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>privacy</title>
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
        
        <h2 align="center">Privacy Policy</h2>
            <p>
            Last updated: February 01, 2024<br><br>

This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.<br><br>

We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy. This Privacy Policy has been created with the help of the Privacy Policy Generator.
        <h1>Interpretation and Definitions</h1>
        <h4>Interpretation</h4>
The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
        <h4>Definitions</h4>
        For the purposes of this Privacy Policy:
        <ul>
  <li>Account means a unique account created for You to access our Service or parts of our Service.</li>
  <li>Affiliate means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.</li>
  <li>Company (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to NepQue.</li>
  <li>Website refers to NepQue, accessible from" https://bhabishyabhattnepal.com.np/nepque"</a></li>
</ul> 
<h1>Changes to this Privacy Policy</h1>
We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.

We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.

You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
<h3>Contact Us</h3>
If you have any questions about this Privacy Policy, You can contact us:
By visiting this page on our website: <a href="https://bhabishyabhattnepal.com.np/nepque/contact">Click here</a>




          
            </p>
        </section>
    </main>
</body>
</html>
