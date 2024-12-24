<?php
// Activer l'affichage des erreurs pour le débogage
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers CORS et JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Configuration
$apiKey = 'n6J6iHLnJVMNdNgb';
$cacheFile = __DIR__ . '/cache/items.json';
$wantedItems = ['ledx', 'gpu', 'intelligence', 'tetriz'];
$results = [];

function getFromCache($cacheFile, $itemNames) {
    if (!file_exists($cacheFile)) {
        return null;
    }

    $data = json_decode(file_get_contents($cacheFile), true);
    if (!$data) {
        return null;
    }

    $results = [];
    foreach ($data as $item) {
        $itemNameLower = strtolower($item['name']);
        foreach ($itemNames as $searchName) {
            if (strpos($itemNameLower, strtolower($searchName)) !== false) {
                $results[] = [
                    'name' => $item['name'],
                    'price' => $item['price'],
                    'iconLink' => $item['icon']
                ];
                break;
            }
        }
    }

    return !empty($results) ? $results : null;
}

function getFromAPI($apiKey, $items) {
    $results = [];
    foreach ($items as $item) {
        $apiUrl = "https://api.tarkov-market.app/api/v1/pve/item?q=" . urlencode($item) . "&x-api-key=" . $apiKey;
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new Exception('Erreur cURL pour ' . $item . ': ' . curl_error($ch));
        }

        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($httpCode !== 200) {
            throw new Exception("Erreur HTTP $httpCode pour $item: $response");
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Erreur de décodage JSON pour ' . $item);
        }

        if (!empty($data) && is_array($data)) {
            $itemData = $data[0];
            $results[] = [
                'name' => $itemData['name'],
                'price' => $itemData['price'],
                'iconLink' => $itemData['icon']
            ];
        }

        curl_close($ch);
        usleep(100000); // 100ms de délai
    }

    if (empty($results)) {
        throw new Exception('Aucun item trouvé via l\'API');
    }

    return $results;
}

try {
    // Essayer d'abord l'API
    try {
        $results = getFromAPI($apiKey, $wantedItems);
        error_log("Données récupérées depuis l'API");
    } catch (Exception $apiError) {
        error_log("Erreur API: " . $apiError->getMessage() . ". Tentative d'utilisation du cache...");
        
        // Si l'API échoue, essayer le cache
        $results = getFromCache($cacheFile, $wantedItems);
        if (!$results) {
            throw new Exception("Impossible de récupérer les données (API et cache indisponibles)");
        }
        error_log("Données récupérées depuis le cache");
    }

    echo json_encode($results);

} catch (Exception $e) {
    error_log("Erreur fatale dans proxy.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
