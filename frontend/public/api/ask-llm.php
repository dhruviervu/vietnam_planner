<?php
/**
 * Production twin of vite.askLlmPlugin.ts for GoDaddy (PHP) hosting.
 *
 * Keys live OUTSIDE public_html in one of:
 *   1. ~/vietnam-curated-config.php  → <?php return ['GEMINI_API_KEY' => '...', 'GROQ_API_KEY' => ''];
 *   2. Environment variables GEMINI_API_KEY / GROQ_API_KEY (cPanel → Environment Variables)
 *
 * GET  → { provider: 'gemini' | 'groq' | 'none' }
 * POST → { text, provider, model }   body: { messages: [{ role, content }] }
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const RATE_LIMIT_REQUESTS = 30;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const MAX_BODY_BYTES = 96000;
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 12000;
const TOTAL_DEADLINE_SECONDS = 22;

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function load_keys(): array
{
    $keys = ['GEMINI_API_KEY' => '', 'GROQ_API_KEY' => ''];
    $home = getenv('HOME') ?: dirname($_SERVER['DOCUMENT_ROOT'] ?? __DIR__ . '/../..');
    $candidates = [
        rtrim((string) $home, '/') . '/vietnam-curated-config.php',
        dirname((string) ($_SERVER['DOCUMENT_ROOT'] ?? '')) . '/vietnam-curated-config.php',
    ];
    foreach ($candidates as $file) {
        if ($file && is_file($file) && is_readable($file)) {
            $cfg = include $file;
            if (is_array($cfg)) {
                foreach ($keys as $name => $_) {
                    if (!empty($cfg[$name]) && is_string($cfg[$name])) {
                        $keys[$name] = trim($cfg[$name]);
                    }
                }
            }
            break;
        }
    }
    foreach ($keys as $name => $value) {
        if ($value === '') {
            $env = getenv($name);
            if (is_string($env) && trim($env) !== '') {
                $keys[$name] = trim($env);
            }
        }
    }
    return $keys;
}

function provider_of(array $keys): string
{
    if ($keys['GEMINI_API_KEY'] !== '') return 'gemini';
    if ($keys['GROQ_API_KEY'] !== '') return 'groq';
    return 'none';
}

function client_ip(): string
{
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return preg_replace('/[^0-9a-fA-F:.]/', '', (string) $ip) ?: 'unknown';
}

function rate_limited(): bool
{
    $dir = rtrim(sys_get_temp_dir(), '/\\') . '/vc-ask-llm';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }
    $file = $dir . '/' . hash('sha256', client_ip()) . '.json';
    $now = time();
    $fh = @fopen($file, 'c+');
    if (!$fh) return false;
    flock($fh, LOCK_EX);
    $raw = stream_get_contents($fh);
    $hits = json_decode($raw ?: '[]', true);
    if (!is_array($hits)) $hits = [];
    $hits = array_values(array_filter($hits, static fn($t) => is_int($t) && $t > $now - RATE_LIMIT_WINDOW_SECONDS));
    $limited = count($hits) >= RATE_LIMIT_REQUESTS;
    if (!$limited) $hits[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}

function same_site_request(): bool
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') return true;
    $host = strtolower((string) ($_SERVER['HTTP_HOST'] ?? ''));
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    $strip = static fn(string $h) => preg_replace('/^www\./', '', $h);
    return $originHost !== '' && $strip($originHost) === $strip(preg_replace('/:\d+$/', '', $host));
}

function http_post_json(string $url, array $payload, array $headers, int $timeout): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array_merge(['Content-Type: application/json'], $headers),
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => max(3, $timeout),
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    return [$status, is_string($body) ? $body : '', $error];
}

function gemini_complete(string $key, array $messages, float $deadline): array
{
    $system = [];
    $contents = [];
    foreach ($messages as $m) {
        if ($m['role'] === 'system') {
            $system[] = $m['content'];
            continue;
        }
        $contents[] = [
            'role' => $m['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $m['content']]],
        ];
    }
    $models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
    $configs = [
        ['temperature' => 0.4, 'maxOutputTokens' => 768, 'thinkingConfig' => ['thinkingBudget' => 0]],
        ['temperature' => 0.4, 'maxOutputTokens' => 768],
    ];
    $last = 'empty';
    foreach ($models as $model) {
        foreach ($configs as $generationConfig) {
            $remaining = (int) floor($deadline - microtime(true));
            if ($remaining < 3) throw new RuntimeException($last . ':deadline');
            $payload = ['contents' => $contents, 'generationConfig' => $generationConfig];
            if ($system) $payload['system_instruction'] = ['parts' => [['text' => implode("\n", $system)]]];
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . $model
                . ':generateContent?key=' . rawurlencode($key);
            [$status, $body, $err] = http_post_json($url, $payload, [], min(13, $remaining));
            if ($err !== '') { $last = "$model:timeout"; continue 2; }
            if ($status < 200 || $status >= 300) { $last = "$model:$status"; continue; }
            $data = json_decode($body, true);
            $parts = $data['candidates'][0]['content']['parts'] ?? [];
            $text = trim(implode('', array_map(static fn($p) => (string) ($p['text'] ?? ''), is_array($parts) ? $parts : [])));
            if ($text !== '') return ['text' => $text, 'model' => $model];
            $last = "$model:empty";
        }
    }
    throw new RuntimeException($last);
}

function groq_complete(string $key, array $messages, float $deadline): array
{
    $remaining = (int) floor($deadline - microtime(true));
    [$status, $body, $err] = http_post_json(
        'https://api.groq.com/openai/v1/chat/completions',
        [
            'model' => 'llama-3.3-70b-versatile',
            'temperature' => 0.35,
            'max_tokens' => 420,
            'messages' => $messages,
        ],
        ['Authorization: Bearer ' . $key],
        min(15, max(3, $remaining)),
    );
    if ($err !== '') throw new RuntimeException('groq:timeout');
    if ($status < 200 || $status >= 300) throw new RuntimeException("groq:$status");
    $data = json_decode($body, true);
    $text = trim((string) ($data['choices'][0]['message']['content'] ?? ''));
    if ($text === '') throw new RuntimeException('groq:empty');
    return ['text' => $text, 'model' => 'llama-3.3-70b-versatile'];
}

function clean_messages($raw): array
{
    if (!is_array($raw)) return [];
    $out = [];
    foreach (array_slice($raw, -MAX_MESSAGES) as $m) {
        if (!is_array($m)) continue;
        $role = $m['role'] ?? '';
        $content = $m['content'] ?? '';
        if (!in_array($role, ['system', 'user', 'assistant'], true) || !is_string($content)) continue;
        $content = trim(mb_substr($content, 0, MAX_MESSAGE_CHARS));
        if ($content === '') continue;
        $out[] = ['role' => $role, 'content' => $content];
    }
    return $out;
}

$keys = load_keys();
$provider = provider_of($keys);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    respond(200, ['provider' => $provider]);
}
if ($method !== 'POST') {
    respond(405, ['error' => 'method']);
}
if (!same_site_request()) {
    respond(403, ['error' => 'origin']);
}
if ($provider === 'none') {
    respond(501, ['error' => 'no-key', 'provider' => 'none']);
}
if (!function_exists('curl_init')) {
    respond(500, ['error' => 'curl-missing']);
}
if (rate_limited()) {
    respond(429, ['error' => 'rate-limited']);
}

$rawBody = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if ($rawBody === false || strlen($rawBody) > MAX_BODY_BYTES) {
    respond(413, ['error' => 'too-large']);
}
$parsed = json_decode($rawBody, true);
$messages = clean_messages(is_array($parsed) ? ($parsed['messages'] ?? []) : []);
if (!$messages) {
    respond(400, ['error' => 'no-messages']);
}

$deadline = microtime(true) + TOTAL_DEADLINE_SECONDS;
try {
    $result = $provider === 'gemini'
        ? gemini_complete($keys['GEMINI_API_KEY'], $messages, $deadline)
        : groq_complete($keys['GROQ_API_KEY'], $messages, $deadline);
    respond(200, ['text' => $result['text'], 'provider' => $provider, 'model' => $result['model']]);
} catch (Throwable $e) {
    respond(502, ['error' => $e->getMessage() ?: 'llm-failed']);
}
