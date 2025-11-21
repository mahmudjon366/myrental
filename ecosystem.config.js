module.exports = {
  apps: [
    {
      name: 'rentacloud-backend',
      script: './backend/src/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      
      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      
      // Logging configuration
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      
      // Monitoring and restart configuration
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Auto restart configuration
      autorestart: true,
      
      // Process management
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Health monitoring
      health_check_grace_period: 3000,
      
      // Advanced options
      node_args: '--max-old-space-size=1024',
      
      // Source map support (for debugging)
      source_map_support: true,
      
      // Merge logs from different instances
      merge_logs: true,
      
      // Instance variables (useful for load balancing)
      instance_var: 'INSTANCE_ID',
      
      // Graceful shutdown
      kill_retry_time: 100,
      
      // Cron restart (optional - restart every day at 3 AM)
      // cron_restart: '0 3 * * *',
      
      // Post deploy hooks (optional)
      // post_update: ['npm install', 'echo "Deployment finished"'],
      
      // Environment file
      env_file: './backend/.env'
    }
  ],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: 'ubuntu',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'https://github.com/mahmudjon366/rentacloud.git',
      path: '/home/ubuntu/rentacloud',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};