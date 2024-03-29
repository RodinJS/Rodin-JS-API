import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import cors from 'cors';
import httpStatus from '../server/helpers/httpStatus';
import expressWinston from 'express-winston';
import expressValidation from 'express-validation';
import helmet from 'helmet';
import winstonInstance from './winston';
import apiRoutes from '../server/routes';
import rodinSocketRoutes from '../socketServer/routes';
import socketRoutes from '../server/routes/socket';
import config from './env';
import APIError from '../server/helpers/APIError';
import passport from 'passport';

const app = express();

if (config.env === 'development') {
	app.use(logger('dev'));
}

// parse body params and attache them to req.body
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// enable detailed API logging in dev env
if (config.env === 'development') {
	expressWinston.requestWhitelist.push('body');
	expressWinston.responseWhitelist.push('body');
	app.use(expressWinston.logger({
		winstonInstance,
		meta: true, 	// optional: log meta data about request (defaults to true)
		msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
		colorStatus: true 	// Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
	}));
}

// mount all apiRoutes on /api path
app.use('/api', apiRoutes);

app.use('/ss', rodinSocketRoutes);

// mount all socketRoutes on /socket path
app.use('/socket', socketRoutes);

// if error is not an instanceOf APIError, convert it.
app.use((err, req, res, next) => {
	if (err instanceof expressValidation.ValidationError) {
		// validation error contains errors which is an array of error each containing message[]
		const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
		const error = new APIError(unifiedErrorMessage, err.status, true);
		return next(error);
	} else if (!(err instanceof APIError)) {
		const apiError = new APIError(err.message, err.status, err.isPublic);
		return next(apiError);
	}
	return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new APIError('API not found', httpStatus.NOT_FOUND);
	return next(err);
});

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
	app.use(expressWinston.errorLogger({
		winstonInstance
	}));
}

//error handler, send stacktrace only during development
app.use((err, req, res, next) => {
	res.status(err.status).json({
		success: false,
		error: {
			message: err.isPublic ? err.message : httpStatus[err.status],
			status: err.status,
			type: httpStatus[err.status],
			timestamp: Date.now()
		}
	});
});

// disable cache
app.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

export default app;
