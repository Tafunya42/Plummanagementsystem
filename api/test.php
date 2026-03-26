<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include files
require_once __DIR__ . '/../includes/config.php';

// Check email_verifications table
echo "<h2>Email Verifications Table Check</h2>";

$result = $conn->query("SHOW TABLES LIKE 'email_verifications'");
if ($result->num_rows > 0) {
  echo "✓ email_verifications table exists<br><br>";

  // Show table structure
  $result = $conn->query("DESCRIBE email_verifications");
  echo "<h3>Table Structure:</h3>";
  echo "<table border='1' cellpadding='5'>";
  echo "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th></tr>";
  while ($row = $result->fetch_assoc()) {
    echo "<tr>";
    echo "<td>{$row['Field']}</td>";
    echo "<td>{$row['Type']}</td>";
    echo "<td>{$row['Null']}</td>";
    echo "<td>{$row['Key']}</td>";
    echo "</tr>";
  }
  echo "</table><br>";

  // Show recent records
  $result = $conn->query("
        SELECT ev.*, u.email, u.full_name 
        FROM email_verifications ev 
        JOIN users u ON ev.user_id = u.id 
        ORDER BY ev.created_at DESC 
        LIMIT 5
    ");

  if ($result->num_rows > 0) {
    echo "<h3>Recent Verification Records:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>User ID</th><th>Code</th><th>Token</th><th>Expires At</th><th>Used</th><th>Email</th><th>Name</th></tr>";
    while ($row = $result->fetch_assoc()) {
      echo "<tr>";
      echo "<td>{$row['id']}</td>";
      echo "<td>{$row['user_id']}</td>";
      echo "<td>{$row['code']}</td>";
      echo "<td>" . substr($row['token'], 0, 20) . "...</td>";
      echo "<td>{$row['expires_at']}</td>";
      echo "<td>{$row['used']}</td>";
      echo "<td>{$row['email']}</td>";
      echo "<td>{$row['full_name']}</td>";
      echo "</tr>";
    }
    echo "</table>";
  } else {
    echo "No verification records found.<br>";
  }
} else {
  echo "✗ email_verifications table does NOT exist!<br>";
  echo "Please run the SQL to create it:<br>";
  echo "<pre>
    CREATE TABLE IF NOT EXISTS `email_verifications` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `code` varchar(10) NOT NULL,
        `token` varchar(255) NOT NULL,
        `expires_at` datetime NOT NULL,
        `used` tinyint(1) DEFAULT 0,
        `used_at` datetime DEFAULT NULL,
        `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `token` (`token`),
        KEY `code` (`code`),
        KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    </pre>";
}
