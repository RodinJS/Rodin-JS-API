"use strict";

const conf = require("../../config");

const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mongoose = require('mongoose');
const User = require('../../models/User');

// const request = require('request').defaults({ encoding: null });
// const uniqueString = require("../uniqueString")("abcdefghijklmnopqrstuvwxyz", 8);


// var User = mongoose.model('User');
/**
 * Local Strategy
 */
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  (username, password, done) => {
    User.findOne({ email: username }, (err, user) => {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));

// /**
//  * Facebook Strategy
//  */
// passport.use(new FacebookStrategy(conf.get("social:facebook"),   function(accessToken, refreshToken, profile, cb) {
//     User.findOne(
//         {
//             $or: [
//                 {
//                     social_network: "facebook",
//                     social_uid: profile.id
//                 },
//                 {
//                     email: profile._json.email
//                 }
//             ]
//         },
//         function (err, user) {
//             if(err) {
//                 return cb(err);
//             }

//             if(user) {
//                 user.social_network = "facebook";
//                 user.social_access_token = accessToken;
//                 user.social_uid = profile.id;

//                 if(profile.photos) {
//                     let url = profile.photos[0].value;
//                     request.get(url, function (error, response, body) {
//                         if (!error && response.statusCode == 200) {
//                             let avatar = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
//                             user.avatar = avatar;
//                             user.save(cb);
//                         }
//                     });
//                 }
//                 return;
//             }

//             let newUser = new User();
//             newUser.social_network = "facebook";
//             newUser.social_access_token = accessToken;
//             newUser.social_uid = profile.id;
//             newUser.name = profile._json.name;
//             newUser.email = profile._json.email;
//             newUser.password = uniqueString();

//             if(profile.photos) {
//                 let url = profile.photos[0].value;
//                 request.get(url, function (error, response, body) {
//                     if (!error && response.statusCode == 200) {
//                         let avatar = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
//                         newUser.avatar = avatar;
//                         newUser.save((err, newUser) => {
//                             if(err) {
//                                 return cb(err);
//                             }

//                             return cb(null, newUser);
//                         });
//                     }
//                 });
//             }
            
//         }
//     );
// }));

// /**
//  * Google Strategy
//  */
// passport.use(new GoogleStrategy(conf.get("social:google"), (req, accessToken, refreshToken, profile, cb) => {
//     console.log(profile);
//     User.findOne(
//         {
//             $or: [
//                 {
//                     social_network: "google",
//                     social_uid: profile.id
//                 },
//                 {
//                     email: profile.email
//                 }
//             ]
//         },
//         function (err, user) {
//             if(err) {
//                 return cb(err);
//             }

//             if(user) {
//                 user.social_network = "google";
//                 user.social_access_token = accessToken;
//                 user.social_uid = profile.id;
//                 if(profile.photos) {
//                     let url = profile.photos[0].value;
//                     request.get(url, function (error, response, body) {
//                         if (!error && response.statusCode == 200) {
//                             let avatar = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
//                             user.avatar = avatar;
//                             user.save(cb);
//                         }
//                     });
//                 }
//                 return;
//             }

//             let newUser = new User();
//             newUser.social_network = "google";
//             newUser.social_access_token = accessToken;
//             newUser.social_uid = profile.id;
//             newUser.email = profile.email;
//             newUser.name = profile.displayName;
//             newUser.password = uniqueString();

//             if(profile.photos) {
//                 let url = profile.photos[0].value;
//                 request.get(url, function (error, response, body) {
//                     if (!error && response.statusCode == 200) {
//                         let avatar = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
//                         newUser.avatar = avatar;
//                         newUser.save((err, newUser) => {
//                             if(err) {
//                                 return cb(err);
//                             }

//                             return cb(null, newUser);
//                         });
//                     }
//                 });
//             }
//         }
//     );
// }));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});



/**
 * Login Required middleware.
 */
passport.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

module.exports = passport;