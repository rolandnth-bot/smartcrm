<?php
/**
 * Auth Check API
 */
session_start();

if (empty($_SESSION['user_id'])) {
    jsonResponse(['authenticated' => false]);
}

$db = getDB();
$stmt = $db->prepare("SELECT id, email, name, role, status FROM users WHERE id = ? AND status = 'active'");
$stmt->execute([$_SESSION['user_id']]);
$user = $stmt->fetch();

if (!$user) {
    session_destroy();
    jsonResponse(['authenticated' => false]);
}

jsonResponse([
    'authenticated' => true,
    'user' => $user
]);
