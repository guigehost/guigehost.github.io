<?php
// 设置HTTP头
header('Referrer-Policy: no-referrer');
header('Content-Type: application/json');

// 从URL参数获取video_id
$videoId = $_GET['video_id'] ?? '';

// 严格验证video_id格式（根据API文档要求）
if (!preg_match('/^[a-zA-Z0-9_-]{8,20}$/', $videoId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid video_id format']);
    exit;
}

// 使用正确的API域名（注意与文档一致）
$apiUrl = 'https://api.xingzhi.ge.com/API/playlet/';

// 添加所有必要参数（根据文档）
$params = [
    'video_id' => $videoId,
    'quality' => $_GET['quality'] ?? '720p', // 默认720p
    'page' => $_GET['page'] ?? 1,
    'timestamp' => time() // 添加时间戳防止缓存
];

// 构建带参数的URL
$apiUrl .= '?' . http_build_query($params);

// 设置更真实的请求头
$headers = [
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest',
    'X-Client-Version: 6.7.1',
    'X-Device-Id: ' . bin2hex(random_bytes(8))
];

// 初始化CURL
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    CURLOPT_REFERER => 'https://app.xingzhi.ge.com/',
    CURLOPT_ENCODING => 'gzip, deflate',
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_CONNECTTIMEOUT => 15,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 3
]);

// 执行请求
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// 错误处理
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'CURL_ERROR',
        'message' => curl_error($ch)
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// 处理403错误
if ($httpCode === 403) {
    http_response_code(403);
    echo json_encode([
        'error' => 'API_ACCESS_DENIED',
        'message' => 'Server rejected the request',
        'possible_causes' => [
            'Invalid domain',
            'Missing authentication',
            'IP restriction',
            'Rate limiting'
        ]
    ]);
    exit;
}

// 处理其他非200响应
if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode([
        'error' => 'API_ERROR',
        'http_code' => $httpCode,
        'response' => $response ? substr($response, 0, 200) : null
    ]);
    exit;
}

// 解析JSON响应
$data = json_decode($response, true);

// 检查JSON解析错误
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode([
        'error' => 'INVALID_JSON',
        'response' => substr($response, 0, 200)
    ]);
    exit;
}

// 调试输出 - 实际部署时应移除
error_log("API Response: " . print_r($data, true));

// 处理视频URL - 更健壮的方式
$videoUrl = null;

// 尝试多种可能的响应结构
if (isset($data['data']['video']['url'])) {
    $videoUrl = $data['data']['video']['url'];
} elseif (isset($data['url'])) {
    $videoUrl = $data['url'];
} elseif (isset($data['video_url'])) {
    $videoUrl = $data['video_url'];
} elseif (isset($data['play_url'])) {
    $videoUrl = $data['play_url'];
}

if ($videoUrl) {
    // 302重定向到视频
    header("Location: $videoUrl", true, 302);
    exit;
}

// 没有找到视频URL
http_response_code(404);
echo json_encode([
    'error' => 'VIDEO_NOT_FOUND',
    'api_response' => $data
]);
?>