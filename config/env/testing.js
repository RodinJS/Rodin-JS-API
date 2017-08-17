export default {
  env: 'testing',
  jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
  db: 'mongodb://mongo:27017/rodin-js-api-testing',
  clientURL: 'https://rodinapp.com',
  editorURL: 'https://editor.rodinapp.com',
  port: 3000,
  socketPort: 4000,
  socketURL: 'https://ss.rodin.space',
  modules: {
    socketService: {
      URL: 'https://modules.rodin.io',
      port: 4000,
    },
  },
  social: {
    facebook: {
      clientID: '1981479458801362',
      clientSecret: 'c7c79a4791b592c54cb79a8b3a671384',
      callbackURL: 'https://rodinapp.com/auth/facebook/callback',
    },
    google: {
      clientID: 'test',
      clientSecret: 'test',
      callbackURL: 'http://yourdormain:3000/auth/google/callback',
    },
    steam: {
      key: 'D62596D7F75C45FFCFA07B938478844F',
      clientSecret: '12377e383557cecdc463f202cdc89758',
      callbackURL: 'http://localhost:3000/api/auth/steam/callback',
    },
    github: {
      clientId: 'd2030c37902fa3d4d0c7',
      clientSecret: 'eb3b8ec68c8dfc03b81383f9486c3f424146a144',
    },
  },
  urlshortenerkey: 'AIzaSyCe5zVHHHhhv40N-WzeffxWva377dPQnH8',
  socket: {
    appId: '358b43a076ed7dc0',
    appSecret: '50835ec1-0392-7c98-60be-3f4ad1b7',
  },
  ios: {
    urls: {
      build: 'http://63.135.170.41:10000/api/v1/project',
      cancel: 'http://63.135.170.41:10000/api/v1/project',
      get: 'http://63.135.170.41:10000/api/v1/project',
      download: 'http://63.135.170.41:10000/api/v1/bin',
      getStatus: 'http://63.135.170.41:10000/api/v1/status',
    },
    appId: '2e659ea81e645f84',
    appSecret: 'af7cffae-17ce-25b2-8b76-849df75a',
  },
  android: {
      urls: {
        build: 'http://13.92.235.174:9001/api/v1/project',
        cancel: 'http://13.92.235.174:9001/api/v1/project',
        get: 'http://13.92.235.174:9001/api/v1/project',
        download: 'http://13.92.235.174:9001/api/v1/bin',
        getStatus: 'http://13.92.235.174:9001/api/v1/status',
      },
      appId: '218100069d1e5a35',
      appSecret: 'bf399907-e750-03f2-2847-043c0a16',
  },
  daydream: {
    urls: {
      build: 'http://13.92.235.174:9001/api/v1/project',
      cancel: 'http://13.92.235.174:9001/api/v1/project',
      get: 'http://13.92.235.174:9001/api/v1/project',
      download: 'http://13.92.235.174:9001/api/v1/bin',
      getStatus: 'http://13.92.235.174:9001/api/v1/status',
    },
    appId: '218100069d1e5a35',
    appSecret: 'bf399907-e750-03f2-2847-043c0a16',
  },
  oculus: {
    urls: {
      build: 'http://13.92.235.174:9002/api/v1/project',
      cancel: 'http://13.92.235.174:9002/api/v1/project',
      get: 'http://13.92.235.174:9002/api/v1/project',
      download: 'http://13.92.235.174:9002/api/v1/bin',
      getStatus: 'http://13.92.235.174:9002/api/v1/status',
    },
    appId: '32520d444efa8135',
    appSecret: '4e5848d1-1a1b-1c3e-be4f-1d1ebdd0',
  },
  vive: {
    urls: {
      build: 'http://13.92.235.174:9003/api/v1/project',
      cancel: 'http://13.92.235.174:9003/api/v1/project',
      get: 'http://13.92.235.174:9003/api/v1/project',
      download: 'http://13.92.235.174:9003/api/v1/bin',
      getStatus: 'http://13.92.235.174:9003/api/v1/status',
    },
    appId: 'dbb75d785cbf220c',
    appSecret: 'bea921f6-5087-31b0-964b-a76f09dc',
  },
  payments: {
    tokens: {
      stripe: {
        secret: 'sk_test_Okevb5aLgncqi6W6lmhItxoV',
        publish: 'pk_test_ubTC5Za2RM1vj2VlRYPhvX2r',
      },
    },
  },
  mandrill: 'ouOYaHWxlDaabLYVjrG1BA',
  stuff_path: '/var/www/stuff/',
  nginx_template_path: '/var/www/api.rodin.io/resources/nginx/',
  nginx_dest_path: '/etc/nginx/custom/',
};
