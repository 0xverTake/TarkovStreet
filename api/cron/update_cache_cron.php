<?php
// Script de mise à jour automatique du cache avec logging
date_default_timezone_set('Europe/Paris');

// Configuration
$apiKey = 'n6J6iHLnJVMNdNgb';
$cacheFile = __DIR__ . '/../cache/items.json';
$logFile = __DIR__ . '/cache_updates.log';
$apiUrl = "https://api.tarkov-market.app/api/v1/pve/items/all?x-api-key=" . $apiKey;

// Fonction de logging
function writeLog($message) {
    global $logFile;
    $date = date('Y-m-d H:i:s');
    $logMessage = "[$date] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    echo $logMessage; // Afficher aussi dans la console
}

// Créer les dossiers nécessaires
if (!file_exists(__DIR__ . '/../cache')) {
    mkdir(__DIR__ . '/../cache', 0777, true);
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
    writeLog("Début de la mise à jour du cache");

    // Sauvegarder l'ancien cache si existe
    if (file_exists($cacheFile)) {
        $backupFile = $cacheFile . '.backup';
        copy($cacheFile, $backupFile);
        writeLog("Sauvegarde de l'ancien cache créée");
    }

    // Télécharger les nouvelles données
    writeLog("Téléchargement des données depuis l'API...");
    $data = downloadItems($apiUrl);
    $items = json_decode($data, true);
    
    if (!$items) {
        throw new Exception("Erreur de décodage JSON");
    }

    // Sauvegarder dans le cache
    file_put_contents($cacheFile, $data);
    writeLog("Cache mis à jour avec succès - " . count($items) . " items");

    // Nettoyer les vieux backups (garder seulement le dernier)
    $oldBackups = glob($cacheFile . '.backup.*');
    foreach ($oldBackups as $oldBackup) {
        unlink($oldBackup);
    }

    writeLog("Mise à jour terminée avec succès");

} catch (Exception $e) {
    writeLog("ERREUR: " . $e->getMessage());
    
    // Restaurer le backup si disponible
    if (isset($backupFile) && file_exists($backupFile)) {
        copy($backupFile, $cacheFile);
        writeLog("Restauration de la sauvegarde effectuée");
    }
    
    exit(1);
}
