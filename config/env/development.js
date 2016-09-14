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
	},
	urlshortenerkey: "AIzaSyCe5zVHHHhhv40N-WzeffxWva377dPQnH8",
	socket: {
		appId  : "358b43a076ed7dc0",
		appSecret : "50835ec1-0392-7c98-60be-3f4ad1b7"
	}
};