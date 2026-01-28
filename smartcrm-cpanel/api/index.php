<?php
/**
 * SmartCRM API Router
 * PHP 8.1+
 */

require_once __DIR__ . '/../config/config.php';

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';

// Parse the URL path
$parsedPath = parse_url($requestUri, PHP_URL_PATH);

// Remove base path and any subdirectory (like smartcrm-cpanel)
$path = str_replace($basePath, '', $parsedPath);
// Remove leading subdirectory if present (e.g., /smartcrm-cpanel/api/email/send -> /email/send)
$path = preg_replace('#^/[^/]+/api/#', '/', $path);
$path = trim($path, '/');

$method = $_SERVER['REQUEST_METHOD'];

// Route the request
$routes = [
    // Auth
    'GET:auth/check' => 'auth/check.php',
    'POST:auth/login' => 'auth/login.php',
    'POST:auth/register' => 'auth/register.php',
    'POST:auth/logout' => 'auth/logout.php',
    
    // Users
    'GET:users' => 'users/list.php',
    'GET:users/{id}' => 'users/get.php',
    'POST:users' => 'users/create.php',
    'PUT:users/{id}' => 'users/update.php',
    'DELETE:users/{id}' => 'users/delete.php',
    
    // Workers
    'GET:workers' => 'workers/list.php',
    'GET:workers/{id}' => 'workers/get.php',
    'POST:workers' => 'workers/create.php',
    'PUT:workers/{id}' => 'workers/update.php',
    'DELETE:workers/{id}' => 'workers/delete.php',
    
    // Apartments
    'GET:apartments' => 'apartments/list.php',
    'GET:apartments/{id}' => 'apartments/get.php',
    'POST:apartments' => 'apartments/create.php',
    'PUT:apartments/{id}' => 'apartments/update.php',
    'DELETE:apartments/{id}' => 'apartments/delete.php',
    
    // Jobs
    'GET:jobs' => 'jobs/list.php',
    'GET:jobs/{id}' => 'jobs/get.php',
    'POST:jobs' => 'jobs/create.php',
    'PUT:jobs/{id}' => 'jobs/update.php',
    'DELETE:jobs/{id}' => 'jobs/delete.php',
    
    // Bookings
    'GET:bookings' => 'bookings/list.php',
    'GET:bookings/{id}' => 'bookings/get.php',
    'POST:bookings' => 'bookings/create.php',
    'PUT:bookings/{id}' => 'bookings/update.php',
    'DELETE:bookings/{id}' => 'bookings/delete.php',
    
    // Leads
    'GET:leads' => 'leads/list.php',
    'GET:leads/{id}' => 'leads/get.php',
    'POST:leads' => 'leads/create.php',
    'PUT:leads/{id}' => 'leads/update.php',
    'DELETE:leads/{id}' => 'leads/delete.php',
    
    // Laundry
    'GET:laundry' => 'laundry/list.php',
    'POST:laundry' => 'laundry/create.php',
    'PUT:laundry/{id}' => 'laundry/update.php',
    
    // Stats
    'GET:stats/overview' => 'stats/overview.php',
    'GET:stats/workers' => 'stats/workers.php',
    'GET:stats/apartments' => 'stats/apartments.php',
    
    // Settings
    'GET:settings' => 'settings/get.php',
    'PUT:settings' => 'settings/update.php',
    
    // Email
    'POST:email/send' => 'email/send.php',
    
    // iCal Sync
    'POST:ical/sync' => 'ical/sync.php',
    'GET:ical/status/{apartmentId}' => 'ical/status.php',
    
    // Test Data (csak development módban)
    'POST:test/load-seed-data' => 'test/load-seed-data.php',
];

// Find matching route
$matchedRoute = null;
$params = [];

foreach ($routes as $route => $file) {
    list($routeMethod, $routePath) = explode(':', $route, 2);
    
    if ($routeMethod !== $method) continue;
    
    // Convert route pattern to regex
    $pattern = preg_replace('/\{([^}]+)\}/', '([^/]+)', $routePath);
    $pattern = '#^' . $pattern . '$#';
    
    if (preg_match($pattern, $path, $matches)) {
        $matchedRoute = $file;
        array_shift($matches);
        
        // Extract parameter names
        preg_match_all('/\{([^}]+)\}/', $routePath, $paramNames);
        foreach ($paramNames[1] as $i => $name) {
            $params[$name] = $matches[$i] ?? null;
        }
        break;
    }
}

// Execute route or return 404
if ($matchedRoute) {
    // Make params available
    $_REQUEST = array_merge($_REQUEST, $params);
    $GLOBALS['routeParams'] = $params;
    
    $filePath = __DIR__ . '/endpoints/' . $matchedRoute;
    if (file_exists($filePath)) {
        require $filePath;
    } else {
        jsonResponse(['error' => 'Endpoint not implemented'], 501);
    }
} else {
    jsonResponse(['error' => 'Not found', 'path' => $path, 'method' => $method], 404);
}
