export default {
  env: 'test',
  jwtSecret: '4DNSrMPuX3Y3McBu96wd2GzGheDX4ft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN87F',
  db: 'mongodb://localhost/rodin-js-api-test',
  port: 5000,
  socketPort: 6000,
  socketURL:'http://localhost:6000',
  clientURL: 'https://rodin.space',
  social: {
    facebook: {
      clientID: "test",
      clientSecret: "test",
      callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    google: {
      clientID: "test",
      clientSecret: "test",
      callbackURL: "http://yourdormain:3000/auth/google/callback"
    },
    steam: {
      key: "D62596D7F75C45FFCFA07B938478844F",
      clientSecret: "12377e383557cecdc463f202cdc89758",
      callbackURL: "http://localhost:3000/api/auth/steam/callback"
    }
  },
  urlshortenerkey: "AIzaSyCe5zVHHHhhv40N-WzeffxWva377dPQnH8",
  socket: {
    appId: "358b43a076ed7dc0",
    appSecret: "50835ec1-0392-7c98-60be-3f4ad1b7"
  },
  payments: {
    tokens: {
      stripe: {
        secret: 'sk_test_Okevb5aLgncqi6W6lmhItxoV',
        publish: 'pk_test_ubTC5Za2RM1vj2VlRYPhvX2r'
      }
    }
  },
  stuff_path: ''
};
