require('dotenv').config()
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME,
      script: './server.js',
      watch: true,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: process.env.NODE_PORT,
        CAPTCHA_KEY: process.env.CAPTCHA_KEY,
        NODE_ENV: 'production',
      },
    },
  ],
}
