<?php
/**
 * Logout API
 */
session_start();
session_destroy();

jsonResponse(['success' => true, 'message' => 'Sikeres kijelentkezés']);
