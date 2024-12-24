<?php
// Script pour mettre à jour le cache des items

// Configuration
$apiKey = 'n6J6iHLnJVMNdNgb';
$cacheFile = __DIR__ . '/cache/items.json';
$apiUrl = "https://api.tarkov-market.app/api/v1/pve/items/all?x-api-key=" . $apiKey;

// Créer le dossier cache s'il n'existe pas
if (!file_exists(__DIR__ . '/cache')) {
    mkdir(__DIR__ . '/cache', 0777, true);
}

// Fonction pour télécharger les données
function downloadItems($url) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false
    ]);

    $response = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception('Erreur cURL: ' . curl_error($ch));
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($httpCode !== 200) {
        throw new Exception("Erreur HTTP $httpCode: $response");
    }

    curl_close($ch);
    return $response;
}

try {
    // Télécharger les données
    echo "Téléchargement des données...\n";
    $data = downloadItems($apiUrl);

    // Sauvegarder dans le cache
    echo "Sauvegarde dans le cache...\n";
    file_put_contents($cacheFile, $data);

    echo "Mise à jour terminée !\n";
    echo "Nombre d'items: " . count(json_decode($data, true)) . "\n";

} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
