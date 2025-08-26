import express from 'express';
import { createOrganization, getOrganizationList } from '../controllers/organization.controller.js';
import { AuthMiddleware, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create-organization', AuthMiddleware, requireAdmin, createOrganization);
router.get("/get-organization-list", getOrganizationList);

export default router;