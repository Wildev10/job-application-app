<?php

return [
    'secret_key' => env('FEDAPAY_SECRET_KEY'),
    'public_key' => env('FEDAPAY_PUBLIC_KEY'),
    'environment' => env('FEDAPAY_ENVIRONMENT', 'sandbox'),
    'mock_mode' => (bool) env('FEDAPAY_MOCK_MODE', false),
    'mock_auto_approve' => (bool) env('FEDAPAY_MOCK_AUTO_APPROVE', true),
    'webhook_secret' => env('FEDAPAY_WEBHOOK_SECRET'),
    'callback_url' => env('FEDAPAY_CALLBACK_URL'),
    'return_url' => env('FEDAPAY_RETURN_URL'),
    'cancel_url' => env('FEDAPAY_CANCEL_URL'),
    'pro_price' => (int) env('PRO_PLAN_PRICE', 1500000),
];
