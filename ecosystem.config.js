module.exports = {
  apps: [
    {
      name: "guess-the-jam-server",
      script: "dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        WEBSOCKET_PORT: 3001,
        WEBSOCKET_HOST: "0.0.0.0",
        CORS_ORIGIN: "*",
      },
      env_production: {
        NODE_ENV: "production",
        WEBSOCKET_PORT: 3001,
        WEBSOCKET_HOST: "0.0.0.0",
        CORS_ORIGIN: "*",
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
