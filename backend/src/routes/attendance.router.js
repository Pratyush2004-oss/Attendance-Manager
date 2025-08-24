import express from "express";
import { AuthMiddleware, VerifyStudent, VerifyTeacher } from "../middleware/auth.middleware.js";
import { getAttendanceForStudent, getAttendanceofAllStudents, markAttendance, updateAttendanceofPerticularStudent } from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark-attendance", AuthMiddleware, VerifyTeacher, markAttendance);
router.get("/get-attendance-for-student/:month", AuthMiddleware, VerifyStudent, getAttendanceForStudent);
router.post("/get-attendance-of-all-students", AuthMiddleware, VerifyTeacher, getAttendanceofAllStudents);
router.post("/update-status-of-student-in-attendance" , AuthMiddleware, VerifyTeacher, updateAttendanceofPerticularStudent);

export default router;