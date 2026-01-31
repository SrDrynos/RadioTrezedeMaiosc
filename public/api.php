
<?php
/**
 * API SIMPLES PARA REACT (FLAT-FILE DATABASE)
 * Salva todos os dados em um arquivo .json único.
 * Ideal para hospedagens compartilhadas (CPanel) sem configurar SQL.
 */

// Configurações de CORS (Permite que o React acesse este script)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Arquivo onde os dados ficarão salvos
$dbFile = 'database.json';

// Lidar com solicitação OPTIONS (Pre-flight do navegador)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. LER DADOS (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dbFile)) {
        echo file_get_contents($dbFile);
    } else {
        // Retorna objeto vazio se não existir ainda
        echo json_encode(['status' => 'empty', 'data' => null]);
    }
    exit();
}

// 2. SALVAR DADOS (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recebe o JSON cru do corpo da requisição
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if ($input) {
        // Verifica se é uma mesclagem ou substituição completa
        // Para simplificar e evitar conflitos, o Admin envia o estado completo das chaves alteradas
        
        $currentData = [];
        if (file_exists($dbFile)) {
            $currentData = json_decode(file_get_contents($dbFile), true);
            if (!is_array($currentData)) $currentData = [];
        }

        // Mescla os dados novos com os existentes
        // O React envia { "radio_13_news": [...], "radio_13_settings": {...} }
        foreach ($input as $key => $value) {
            $currentData[$key] = $value;
        }

        // Salva no arquivo
        if (file_put_contents($dbFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'Dados salvos no servidor']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro de permissão de escrita. Verifique o CHMOD da pasta.']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    }
    exit();
}
?>
