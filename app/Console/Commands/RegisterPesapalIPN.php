<?php

namespace App\Console\Commands;

use App\Services\PesapalService;
use Illuminate\Console\Command;

class RegisterPesapalIPN extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'register:pesapal-ipn';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Register Pesapal IPN URL';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting Pesapal IPN registration...');

        // Check if credentials are set
        $consumerKey = config('pesapal.consumer_key');
        $consumerSecret = config('pesapal.consumer_secret');
        $baseUrl = config('pesapal.base_url');

        if (empty($consumerKey) || empty($consumerSecret)) {
            $this->error('❌ Pesapal credentials not found in .env file!');
            $this->info('Please add PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET to your .env file');
            return 1;
        }

        $this->info('✅ Credentials found');
        $this->info('🌐 Base URL: ' . $baseUrl);
        $this->info('🔑 Consumer Key: ' . substr($consumerKey, 0, 10) . '...');

        $pesapalService = app(PesapalService::class);

        // First, test if we can get an access token
        $this->info('🔐 Testing access token...');
        $token = $pesapalService->getAccessToken();

        if (!$token) {
            $this->error('❌ Failed to get access token!');
            $this->info('Please check your credentials and try again');
            return 1;
        }

        $this->info('✅ Access token obtained: ' . substr($token, 0, 20) . '...');

        // Register IPN
        $this->info('📡 Registering IPN URL...');
        $result = $pesapalService->registerIPN();

        if ($result['success']) {
            $this->info('🎉 IPN registered successfully!');
            $this->info('📋 Notification ID: ' . $result['notification_id']);
            $this->info('🌐 Callback URL: ' . $result['url']);
            $this->line('');
            $this->warn('📝 IMPORTANT: Add this to your .env file:');
            $this->line('PESAPAL_NOTIFICATION_ID=' . $result['notification_id']);
            $this->line('');
        } else {
            $this->error('❌ Failed to register IPN: ' . $result['error']);

            // Additional debugging info
            if (config('pesapal.debug')) {
                $this->warn('🔍 Debug mode is enabled. Check your logs for more details.');
            }
        }

        return $result['success'] ? 0 : 1;
    }
}
