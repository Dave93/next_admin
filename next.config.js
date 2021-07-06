console.log(process.env.API_URL);
module.exports = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl: process.env.API_URL,
  },
  async rewrites() {
    return [
      {
        source: '/api/login',
        destination: `${process.env.API_URL}/login`,
      },
      {
        source: '/api/logout',
        destination: `${process.env.API_URL}/logout`,
      },
      {
        source: '/api/:route*',
        destination: `${process.env.API_URL}/api/:route*`,
      },
    ]
  },
}
