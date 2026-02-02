
<?php
// Proxy para Status da Rádio (Link Nacional)
// Resolve erro de Mixed Content (Site HTTPS tentando acessar API HTTP)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// URL da API da Rádio (HTTP inseguro)
$apiUrl = 'http://radio.linknacional.com/api-json/Njk4Misx';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Radio13App)');
// Importante: Seguir redirecionamentos caso a API mude
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 400 && $response) {
    echo $response;
} else {
    // Fallback manual para o painel não quebrar se a API cair
    echo json_encode([
        "status" => "OFFLINE (Erro Proxy)",
        "porta" => "0000",
        "ip" => "0.0.0.0",
        "ouvintes_conectados" => "0",
        "musica_atual" => "Aguardando conexão...",
        "capa_musica" => ""
    ]);
}
?>
