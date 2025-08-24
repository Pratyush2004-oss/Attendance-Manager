import express from 'express';
import { checkAdmin, checkAuth, loginUser, registerUser, verifyUser } from '../controllers/auth.controller.js';
import { AuthMiddleware, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-user', verifyUser);
router.post('/login', loginUser);
router.get("/check-auth", AuthMiddleware, checkAuth);
router.get("/check-admin", AuthMiddleware, requireAdmin, checkAdmin);


export default router;