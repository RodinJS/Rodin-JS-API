// Importing Passport, strategies, and config
import passport from 'passport';
import User from '../server/models/user';
import config from './env';
import {ExtractJwt} from 'passport-jwt';
import {Strategy as JwtStrategy} from 'passport-jwt';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';

// Setting JWT strategy options
const jwtOptions = {
  // Telling Passport to check headers for JWT
  jwtFromRequest: ExtractJwt.fromHeader('x-access-token'),
  // Telling Passport where to find the secret
  secretOrKey: config.jwtSecret

  // TO-DO: Add issuer and audience checks
};

// Setting up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findOne({email: payload.email}, (err, user) => {
	if (err) { return done(err, false); }

	if (user) {
	  done(null, user);
	} else {
	  done(null, false);
	}
  });
});

const fbLogin = new FacebookStrategy({
	clientID: config.social.facebook.clientID,
	clientSecret: config.social.facebook.clientSecret,
	callbackURL: config.social.facebook.callbackURL
  },
  (accessToken, refreshToken, profile, done) => {
	User.findOne({ facebookId: profile.id }, (err, user) => {
	  return done(err, user);
	});
  }
);

const googleLogin = new GoogleStrategy({
	clientID:     config.social.google.clientID,
	clientSecret: config.social.google.clientSecret,
	callbackURL: config.social.google.callbackURL,
	passReqToCallback   : true
  },
  (request, accessToken, refreshToken, profile, done) => {
	User.findOne({ googleId: profile.id }, (err, user) => {
	  return done(err, user);
	});
  }
);

passport.use(jwtLogin);
passport.use(fbLogin);
passport.use(googleLogin);