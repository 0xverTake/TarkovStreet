<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure this is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get the raw POST data
$rawData = file_get_contents('php://input');
$data = json_decode($rawData);

if (!$data || !isset($data->message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit();
}

// Your Claude API key and endpoint
$apiKey = getenv('CLAUDE_API_KEY');
if (!$apiKey) {
    error_log('Claude API key not found in environment variables');
    http_response_code(500);
    echo json_encode(['error' => 'Server configuration error']);
    exit();
}

// Prepare the request to Claude API
$claudeEndpoint = 'https://api.anthropic.com/v1/messages';
$headers = [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey,
    'anthropic-version: 2023-06-01'
];

// Prepare the system prompt to ensure Tarkov-focused responses
$systemPrompt = "You are an Escape from Tarkov game assistant. Only provide information and answers related to Escape from Tarkov. If a question is not about Escape from Tarkov, politely inform that you can only help with Tarkov-related questions. Keep responses concise and focused on game mechanics, strategies, locations, items, and quests.";

// Prepare the request data
$requestData = [
    'messages' => [
        [
            'role' => 'user',
            'content' => $data->message
        ]
    ],
    'system' => $systemPrompt,
    'model' => 'claude-3-opus-20240229',
    'max_tokens' => 1000
];

// Initialize cURL session
$ch = curl_init($claudeEndpoint);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POSTFIELDS => json_encode($requestData)
]);

// Execute the request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Log API interaction for debugging
$logEntry = date('Y-m-d H:i:s') . " - Request: " . $data->message . " - HTTP Code: " . $httpCode . "\n";
file_put_contents(__DIR__ . '/chat_log.txt', $logEntry, FILE_APPEND);

// Handle the response
if ($error || $httpCode !== 200) {
    error_log("Claude API Error: $error, HTTP Code: $httpCode");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to get response from AI service']);
    exit();
}

// Parse and return the response
$responseData = json_decode($response);
if (!$responseData || !isset($responseData->content)) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid response from AI service']);
    exit();
}

echo json_encode([
    'response' => $responseData->content[0]->text
]);
