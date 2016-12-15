// Importing Passport, strategies, and config
import passport from 'passport';
import User from '../server/models/user';
import Utils from '../server/helpers/common';
import config from './env';
import {ExtractJwt} from 'passport-jwt';
import {Strategy as JwtStrategy} from 'passport-jwt';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';
import {Strategy as SteamStrategy} from 'passport-steam';
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
        if (err) {
            return done(err, false);
        }

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
        callbackURL: config.social.facebook.callbackURL,
        profileFields: ['id', 'email', 'first_name', 'last_name']

    },
    (accessToken, refreshToken, profile, done) => {

        User.findOne({$or: [{facebookId: profile.id}, {email: profile._json.email}]}, (err, user) => {
            if(err) return done(err, null);

            if(!user){
                let userObject = {
                    email:profile._json.email,
                    username: profile.id,//Utils.getUserNameFromEmail(profile._json.email),
                    password:Utils.generateCode(8),
                    profile: {
                        firstName:profile._json.first_name,
                        lastName:profile._json.last_name
                    },
                    facebookId:profile.id,
                    role:'Free',
                    usernameConfirmed:false
                };
                user = new User(userObject);
                user.saveAsync(userObject)
                    .then((savedUser) => {
                        return done(null, savedUser);
                    })
                    .error((e) => {
                        return done(e, null);
                    });
            }
            else{
                if(!user.facebookId){
                    return User.updateAsync({username: user.username}, {$set: {facebookId:profile.id}})
                        .then(() => {
                            return done(err, user);
                        })
                        .error((e)=> {
                            return done(e, null);
                        });
                }
                return done(err, user);
            }
        });
    }
);

const googleLogin = new GoogleStrategy({
        clientID: config.social.google.clientID,
        clientSecret: config.social.google.clientSecret,
        callbackURL: config.social.google.callbackURL,
        passReqToCallback: true
    },
    (request, accessToken, refreshToken, profile, done) => {
        User.findOne({googleId: profile.id}, (err, user) => {
            return done(err, user);
        });
    }
);


const steamLogin = new SteamStrategy({
        returnURL: config.social.steam.callbackURL,
        realm: 'http://localhost:3000/',
        apiKey: config.social.steam.key
    },
    (identifier, profile, done) => {
        console.log(identifier, profile);
        User.findOne({steamId: identifier}, (err, user) => {
            return done(err, user);
        });
    });

passport.use(jwtLogin);
passport.use(fbLogin);
passport.use(googleLogin);
passport.use(steamLogin);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

export default passport;