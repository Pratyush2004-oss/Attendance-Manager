import express from 'express';
import { AuthMiddleware, VerifyStudent, VerifyTeacher } from '../middleware/auth.middleware.js';
import { addStudentsByTeacher, addStudentUsingCode, createBatch, deleteBatch, deleteStudentFromBatch, getAllBatchesByName, getAllBatchesForStudent, getAllBatchesForTeacher, getAllStudentList, getBatchByIdForStudent, getBatchByIdForTeacher, getStudentById } from '../controllers/batches.controller.js';

const router = express.Router();

router.get("/get-student-list", AuthMiddleware, VerifyTeacher, getAllStudentList);
router.post('/get-sudent-by-id', AuthMiddleware, VerifyTeacher, getStudentById);
router.post("/get-batches-by-name", AuthMiddleware, VerifyStudent, getAllBatchesByName);
router.post("/create-batch", AuthMiddleware, VerifyTeacher, createBatch);
router.post("/add-students-to-batch", AuthMiddleware, VerifyTeacher, addStudentsByTeacher);
router.post('/add-to-batch', AuthMiddleware, VerifyStudent, addStudentUsingCode);
router.put("/delete-student-from-batch", AuthMiddleware, VerifyTeacher, deleteStudentFromBatch);
router.get("/get-batches-for-teacher", AuthMiddleware, VerifyTeacher, getAllBatchesForTeacher);
router.get("/get-batch-By-id-for-teacher/:batchId", AuthMiddleware, VerifyTeacher, getBatchByIdForTeacher);
router.get("/get-batch-By-id-for-students/:batchId", AuthMiddleware, VerifyStudent, getBatchByIdForStudent);
router.get("/get-batches-for-student", AuthMiddleware, VerifyStudent, getAllBatchesForStudent);
router.get("/delete-batch/:batchId", AuthMiddleware, VerifyTeacher, deleteBatch);


export default router;