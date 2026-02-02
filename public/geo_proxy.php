
<?php
// Proxy para Geocodificação (OpenStreetMap Nominatim)
// Resolve problemas de CORS e User-Agent em produção
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$lat = isset($_GET['lat']) ? $_GET['lat'] : '';
$lon = isset($_GET['lon']) ? $_GET['lon'] : '';

if (!$lat || !$lon) {
    echo json_encode(["error" => "Coordenadas ausentes"]);
    exit;
}

// URL da API do Nominatim
$url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$lat}&lon={$lon}&zoom=18&addressdetails=1&accept-language=pt-BR";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// O Nominatim EXIGE um User-Agent válido, senão bloqueia. O PHP consegue enviar isso, o navegador as vezes não.
curl_setopt($ch, CURLOPT_USERAGENT, 'Radio13App/1.0 (contact@radiotrezedemaio.com.br)'); 
curl_setopt($ch, CURLOPT_REFERER, 'https://radiotrezedemaio.com.br');
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    echo $response;
} else {
    // Fallback em caso de erro
    echo json_encode([
        "display_name" => "Endereço não localizado (Erro API)",
        "address" => [
            "road" => "Coordenadas: $lat, $lon",
            "city" => "Desconhecido"
        ]
    ]);
}
?>
