module.exports = {
  apps: [
    {
      name: "masruq-api-gateway",
      script: "./dist/server.cjs",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        APP_URL: "https://rec.masruq.com",
        ADMIN_URL: "https://admin.masruq.com",
        API_URL: "https://api.masruq.com"
      }
    },
    {
      name: "masruq-trading-engine-247",
      script: "./dist/server.cjs",
      env: {
        NODE_ENV: "production",
        MODE: "ENGINE_ONLY",
        TWELVEDATA_API_KEY: "86dbba636fd546d6947f5208b14ece96"
      }
    },
    {
      name: "masruq-notification-worker",
      script: "./dist/server.cjs",
      env: {
        NODE_ENV: "production",
        MODE: "NOTIFICATION_WORKER"
      }
    }
  ]
};
