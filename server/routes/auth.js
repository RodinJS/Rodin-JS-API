import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth';
import config from '../../config/env';
import '../../config/passport';
import passport from 'passport';

const router = express.Router();	// eslint-disable-line new-cap

const requireAuth = passport.authenticate('jwt', { session: false }); // eslint-disable-line
/** POST /api/auth/login - Returns token if correct username and password is provided */
router.route('/login')
  .post(validate(paramValidation.login), authCtrl.login);

/** GET /api/auth/random-number - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/random-number')
  .get(requireAuth, authCtrl.getRandomNumber);
  // .get(expressJwt({ secret: config.jwtSecret }), authCtrl.getRandomNumber);





export default router;
