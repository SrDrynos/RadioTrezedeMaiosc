
<?php
/**
 * API SIMPLES PARA REACT (FLAT-FILE DATABASE + MAIL)
 * Salva todos os dados em um arquivo .json único.
 * Envia e-mails de notificação.
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

// 2. SALVAR DADOS E ENVIAR E-MAIL (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Recebe o JSON cru do corpo da requisição
    $inputJSON = file_get_contents('php://input');
    $input = json_decode($inputJSON, true);

    if ($input) {
        
        // --- LÓGICA DE ENVIO DE E-MAIL ---
        if (isset($input['action']) && $input['action'] === 'send_email') {
            $to = 'drynos.com@gmail.com'; // E-mail fixo conforme solicitado
            $type = $input['type'] ?? 'notification';
            $payload = $input['payload'] ?? [];
            
            $subject = "Nova Notificação - Rádio 13";
            $message = "";

            // Configuração dos Headers
            $headers = "From: noreply@radiotrezedemaio.com.br\r\n";
            $headers .= "Reply-To: noreply@radiotrezedemaio.com.br\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();

            // Formatação da Mensagem
            if ($type === 'request') {
                $subject = "Novo Pedido Musical: " . ($payload['song'] ?? 'Música Desconhecida');
                $message .= "=== NOVO PEDIDO MUSICAL ===\n\n";
                $message .= "Ouvinte: " . ($payload['listenerName'] ?? '-') . "\n";
                $message .= "Local: " . ($payload['location'] ?? '-') . "\n";
                $message .= "Música: " . ($payload['song'] ?? '-') . "\n";
                $message .= "Artista: " . ($payload['artist'] ?? '-') . "\n";
                $message .= "Recado: " . ($payload['message'] ?? '-') . "\n";
                $message .= "Data: " . ($payload['createdAt'] ?? date('d/m/Y H:i')) . "\n";
            } else if ($type === 'message') {
                $subject = "Nova Mensagem de Contato: " . ($payload['name'] ?? 'Visitante');
                $message .= "=== NOVA MENSAGEM DO SITE ===\n\n";
                $message .= "Nome: " . ($payload['name'] ?? '-') . "\n";
                $message .= "E-mail: " . ($payload['email'] ?? '-') . "\n";
                $message .= "Data: " . ($payload['date'] ?? date('d/m/Y H:i')) . "\n";
                $message .= "\nMensagem:\n" . ($payload['message'] ?? '-') . "\n";
            } else {
                $message = "Nova notificação recebida do site: \n" . print_r($payload, true);
            }

            // Tenta enviar o email
            if (mail($to, $subject, $message, $headers)) {
                echo json_encode(['success' => true, 'message' => 'Email enviado com sucesso para ' . $to]);
            } else {
                // Em localhost sem SMTP configurado, isso falhará.
                // Retornamos true para não quebrar a UI, mas logamos o erro no console do server se possível.
                // Em produção (CPanel), mail() costuma funcionar nativamente.
                echo json_encode(['success' => false, 'message' => 'Falha ao enviar e-mail via mail(). Verifique configurações de SMTP/PHP.']);
            }
            exit();
        }

        // --- LÓGICA DE SALVAMENTO NO BANCO (EXISTENTE) ---
        $currentData = [];
        if (file_exists($dbFile)) {
            $currentData = json_decode(file_get_contents($dbFile), true);
            if (!is_array($currentData)) $currentData = [];
        }

        // Mescla os dados novos com os existentes
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
