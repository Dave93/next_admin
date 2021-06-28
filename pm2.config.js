module.exports = {
  apps: [
    {
      name: 'hq_admin',
      script: './server.js',
      watch: true,
      env: {
        PORT: 3000,
        NODE_ENV: 'development',
      },
      env_production: {
        PORT: 4545,
        NODE_ENV: 'production',
      },
    },
  ],
}
