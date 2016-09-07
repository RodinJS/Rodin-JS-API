/**
 * Module dependencies.
 */
const express = require('express');
const logger = require('morgan');
const bodyParser = require("body-parser");
const compression = require('compression');
const mongoose = require('mongoose');
const passport = require('passport');
const dotenv = require('dotenv');
const chalk = require('chalk');
const cors = require('cors');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
// dotenv.load({ path: '.env.prod' });
dotenv.load({ path: '.env.dev' });

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!', chalk.green('+'));
});
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('-'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 7000);
app.use(compression());
app.use(logger('dev'));
app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '5mb'}));
// app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(function(req, res, next) {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//       req.path !== '/login' &&
//       req.path !== '/signup' &&
//       !req.path.match(/^\/auth/) &&
//       !req.path.match(/\./)) {
//     req.session.returnTo = req.path;
//   }
//   next();
// });


app.get('/', (req, res) => {
	res.json({
		"error": "",
		"response": "Gago aper"
	});
});











/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s Express server listening on port %d in %s mode.', chalk.green('+'), app.get('port'), app.get('env'));
});

module.exports = app;