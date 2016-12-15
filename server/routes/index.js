import express from 'express';
import userRoutes from './user';
import projectRoutes from './project';
import authRoutes from './auth';
import editorRoutes from './editor';
import iosRoutes from './ios';
import paymentsRoutes from './payments';
import hooksRoutes from './hooks';
import notificationsRoute from './notifications';
import gitRoute from './git';
import expressSanitized from 'express-sanitize-escape';
import _ from 'lodash';

const router = express.Router();	// eslint-disable-line new-cap
const apiRoutes = {
  user: {
    route: '/user',
    module: userRoutes,
  },
  project: {
    route: '/project',
    module: projectRoutes
  },
  auth: {
    route: '/auth',
    module: authRoutes
  },
  editor: {
    route: '/editor',
    module: editorRoutes
  },
  ios: {
    route: '/ios',
    module: iosRoutes
  },
  payments: {
    route: '/payments',
    module: paymentsRoutes
  },
  hooks: {
    route: '/hooks',
    module: hooksRoutes
  },
  notifications: {
    route: '/notifications',
    module: notificationsRoute
  },
  git: {
    route: '/git',
    module: gitRoute
  }

};


expressSanitized.sanitizeParams(router, Object.keys(apiRoutes));

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

_.each(apiRoutes, (route, key) => {
  router.use(route.route, route.module);
});

export default router;
