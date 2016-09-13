export default {
  env: 'development',
  jwtSecret: '4DNSrMPuQ3Y3McBu96wd2GzGheDXuft8gDqLEQVWHnXQfcaGFtM2ZBgyNYzPN7CK',
  db: 'mongodb://localhost/rodin-js-api-development',
  port: 3000,
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
  	}
  }
};

// Secret Key Examples: 64 charecter 
// KKqZcJfbFs889xCCsQSRncgXnTQ83k2HvdbKPYSTu8fsK6pvN4bMt28UWr4UFhGc
// qRbkYz8DjYa7k3d6YmE7JWZXuCuu2NerT8n4uTPHN7MyK4g5BkDhZ8WmPGwrM6ra
// 9gE99FQJzQyVHrrNEphAnBzKeDAsQR6GPxc4g5ePD2QNAwNxfJKA8BgAgn25a2XW