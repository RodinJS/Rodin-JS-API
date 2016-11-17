import express from 'express';
import userRoutes from './user';
import projectRoutes from './project';
import authRoutes from './auth';
import editorRoutes from './editor';
import iosRoutes from './ios';
import paymentsRoutes from './payments';

const router = express.Router();	// eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) =>
  res.send('OK')
);

// mount user routes at /user
router.use('/user', userRoutes);

// mount project routes at /project
router.use('/project', projectRoutes);


// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount editor routes at /editor
router.use('/editor', editorRoutes);

// mount ios routes at /ios
router.use('/ios', iosRoutes);

//mount stripe payments routes
router.use('/payments', paymentsRoutes);


export default router;
