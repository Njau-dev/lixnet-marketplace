<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Pesapal Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Pesapal payment gateway integration
    |
    */

    'base_url' => env('PESAPAL_BASE_URL', 'https://cybqa.pesapal.com/pesapalv3'),

    'consumer_key' => env('PESAPAL_CONSUMER_KEY'),

    'consumer_secret' => env('PESAPAL_CONSUMER_SECRET'),

    'notification_id' => env('PESAPAL_NOTIFICATION_ID'),

    /*
    |--------------------------------------------------------------------------
    | Callback URLs
    |--------------------------------------------------------------------------
    */

    'callback_url' => env('APP_URL') . '/api/pesapal/callback',

    'confirmation_url' => env('APP_URL') . '/api/pesapal/confirm',

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    */

    'default_currency' => env('PESAPAL_DEFAULT_CURRENCY', 'KES'),

    'redirect_mode' => 'PARENT_WINDOW', // or 'TOP_WINDOW'

    /*
    |--------------------------------------------------------------------------
    | Environment Settings
    |--------------------------------------------------------------------------
    */

    'sandbox' => env('PESAPAL_SANDBOX', true),

    'debug' => env('PESAPAL_DEBUG', false),
];
