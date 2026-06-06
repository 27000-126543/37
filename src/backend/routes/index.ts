import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usersRoutes from './users.routes.js';
import coursesRoutes from './courses.routes.js';
import { assignmentsRouter, submissionsRouter } from './assignments.routes.js';
import { examsRouter, examAttemptsRouter } from './exams.routes.js';
import certificatesRoutes from './certificates.routes.js';
import teachersRoutes from './teachers.routes.js';
import analyticsRoutes from './analytics.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/courses', coursesRoutes);
router.use('/assignments', assignmentsRouter);
router.use('/submissions', submissionsRouter);
router.use('/exams', examsRouter);
router.use('/exam-attempts', examAttemptsRouter);
router.use('/certificates', certificatesRoutes);
router.use('/applications', teachersRoutes);
router.use('/teachers', teachersRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
