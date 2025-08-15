module.exports = {
  apps: [
    {
      name: 'guess-the-jam-websocket',
      script: 'server/websocket.ts',
      interpreter: 'tsx',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        WEBSOCKET_PORT: 3001
      },
      env_development: {
        NODE_ENV: 'development',
        WEBSOCKET_PORT: 3001
      }
    },
    {
      name: 'guess-the-jam-nextjs',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};
