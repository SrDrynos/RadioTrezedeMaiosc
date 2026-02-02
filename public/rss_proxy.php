
<?php
// Proxy Simples para RSS - Resolve problemas de CORS em Produção
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/xml; charset=UTF-8");

if (!isset($_GET['url'])) {
    http_response_code(400);
    echo "URL não fornecida.";
    exit;
}

$url = $_GET['url'];

// Validação básica
if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo "URL inválida.";
    exit;
}

// Inicializa cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Segue redirecionamentos
curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Timeout de 15s
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'); // Finge ser um navegador
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignora erros de SSL (comum em feeds antigos)

$content = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($content === false || $httpCode >= 400) {
    http_response_code(500);
    echo "Erro ao buscar feed: " . $error;
} else {
    echo $content;
}
?>
