<?php
/**
 * Users List API
 */
$db = getDB();
$role = $_GET['role'] ?? null;
$status = $_GET['status'] ?? 'active';

$sql = "SELECT id, email, name, role, phone, company_name, status, created_at FROM users WHERE 1=1";
$params = [];

if ($role) { $sql .= " AND role = ?"; $params[] = $role; }
if ($status !== 'all') { $sql .= " AND status = ?"; $params[] = $status; }
$sql .= " ORDER BY created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
jsonResponse(['users' => $stmt->fetchAll()]);
