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
import domainsRoute from './domains';
import modulesRoute from './modules';
import RodinSanitizer from '../helpers/sanitizer';

import _ from 'lodash';

const router = express.Router();	// eslint-disable-line new-cap

const apiRoutes = {
    user: {
        route: '/user',
        module: [RodinSanitizer.makeSanitize, userRoutes],
    },
    project: {
        route: '/project',
        module: [RodinSanitizer.makeSanitize, projectRoutes],
    },
    auth: {
        route: '/auth',
        module: [RodinSanitizer.makeSanitize, authRoutes],
    },
    editor: {
        route: '/editor',
        module: [editorRoutes],
    },
    ios: {
        route: '/ios',
        module: [RodinSanitizer.makeSanitize, iosRoutes],
    },
    payments: {
        route: '/payments',
        module: [RodinSanitizer.makeSanitize, paymentsRoutes],
    },
    hooks: {
        route: '/hooks',
        module: [RodinSanitizer.makeSanitize, hooksRoutes],
    },
    notifications: {
        route: '/notifications',
        module: [RodinSanitizer.makeSanitize, notificationsRoute],
    },
    git: {
        route: '/git',
        module: [RodinSanitizer.makeSanitize, gitRoute],
    },
    domains: {
        route: '/domains',
        module: [RodinSanitizer.makeSanitize, domainsRoute],
    },
    modules: {
        route: '/modules',
        module: [RodinSanitizer.makeSanitize, modulesRoute],
    },
};
/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

_.each(apiRoutes, (route, key) => {
    router.use(route.route, route.module);
});

export default router;
