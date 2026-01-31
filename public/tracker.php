<?php
// Configurações de CORS para permitir chamadas do React
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");

// Arquivo onde os logs serão salvos
$logFile = 'listeners_log.json';

// 1. Capturar IP Real do Cliente
function get_client_ip() {
    $ipaddress = '';
    if (isset($_SERVER['HTTP_CLIENT_IP']))
        $ipaddress = $_SERVER['HTTP_CLIENT_IP'];
    else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_X_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_X_FORWARDED'];
    else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
        $ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
    else if(isset($_SERVER['HTTP_FORWARDED']))
        $ipaddress = $_SERVER['HTTP_FORWARDED'];
    else if(isset($_SERVER['REMOTE_ADDR']))
        $ipaddress = $_SERVER['REMOTE_ADDR'];
    else
        $ipaddress = 'UNKNOWN';
    
    // Se estiver rodando localmente, usa um IP de teste (Google) para a API funcionar
    if ($ipaddress == '127.0.0.1' || $ipaddress == '::1') {
        return '8.8.8.8'; 
    }
    
    // Pega o primeiro IP se houver múltiplos (proxies)
    $ipParts = explode(',', $ipaddress);
    return trim($ipParts[0]);
}

$ip = get_client_ip();

// 2. Consultar API de Geolocalização (Server-side para evitar erro de Mixed Content HTTPS/HTTP)
// IP-API.com é gratuita para uso não comercial (até 45 req/min)
$apiUrl = "http://ip-api.com/json/{$ip}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,query";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
$response = curl_exec($ch);
curl_close($ch);

$geoData = json_decode($response, true);

if ($geoData && isset($geoData['status']) && $geoData['status'] == 'success') {
    
    // 3. Criar Objeto de Sessão
    $newSession = [
        'id' => uniqid('sess_'),
        'ip' => $geoData['query'],
        'city' => $geoData['city'],
        'region' => $geoData['regionName'],
        'country' => $geoData['country'],
        'lat' => $geoData['lat'],
        'lon' => $geoData['lon'],
        'isp' => $geoData['isp'],
        'connectedAt' => date('c'), // ISO 8601
        'device' => isset($_GET['device']) ? htmlspecialchars($_GET['device']) : 'Web Player'
    ];

    // 4. Ler Log Atual
    $currentData = [];
    if (file_exists($logFile)) {
        $fileContent = file_get_contents($logFile);
        if ($fileContent) {
            $currentData = json_decode($fileContent, true);
            if (!is_array($currentData)) $currentData = [];
        }
    }

    // ALTERADO: Não filtramos mais IPs duplicados agressivamente. 
    // Isso permite que você teste com 2 abas ou 2 dispositivos na mesma rede WiFi.
    // Apenas limitamos o tamanho total da lista para não ficar gigante.
    
    // Adiciona novo no topo
    array_unshift($currentData, $newSession);

    // Mantém apenas os últimos 50 ouvintes (remove os mais antigos)
    $currentData = array_slice($currentData, 0, 50);

    // 5. Salvar
    if (file_put_contents($logFile, json_encode($currentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        echo json_encode(['success' => true, 'data' => $newSession]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro de permissão de escrita no servidor']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Falha na geolocalização', 'debug' => $ip]);
}
?>