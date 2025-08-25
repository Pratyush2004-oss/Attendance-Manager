import expressasyncHandler from "express-async-handler";
import BatchModel from "../models/batches.model.js";
import UserModel from "../models/auth.model.js";
import mongoose from "mongoose";
import AttendanceModel from "../models/attendance.model.js";

// get-student list of the Organization for the teacher so that they can add students to the batch
export const getAllStudentList = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const students = await UserModel.find({ role: "student", isVerified: true, Organization: { $in: user.Organization } }).select("_id name email guardian");
        return res.status(200).json({ students });
    } catch (error) {
        console.log("Error in getAllStudentList controller: " + error);
        next(error);
    }
})

// get student by student id
export const getStudentById = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { studentId } = req.body;
        const student = await UserModel.find({ _id: studentId, role: "student", isVerified: true, Organization: { $in: user.Organization } }).select("_id name email guardian");
        return res.status(200).json({ student });
    } catch (error) {
        console.log("Error in getStudentById controller: " + error);
        next(error);
    }
})

// get all students of the perticular batch only by its teacher
export const getAllStudentsOfBatch = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { batchId } = req.params;

        const batch = await BatchModel.findOne({ _id: batchId, teacherId: user._id })
            .populate("studentIds", "name email guardian _id")
            .populate("teacherId", "name email _id");
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }
        return res.status(200).json({ batch });

    } catch (error) {
        console.log("Error in getAllStudentsOfBatch controller: " + error);
        next(error);
    }
})

// get all the batches by name for the students so they can see that
export const getAllBatchesByName = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { batchName } = req.body;
        const batches = await BatchModel.find({ name: batchName, Organization: { $in: user.Organization } }).populate("teacherId").sort({ createdAt: -1 });
        return res.status(200).json({ batches });
    } catch (error) {
        console.log("Error in getAllBatchesByName controller: " + error);
        next(error);
    }
})

// create batch
export const createBatch = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        console.log(user);
        const { name, Organization } = req.body;

        if (!name || !Organization) {
            return res.status(400).json({ message: "Batch name and Organization is required" });
        }

        // check whether the Organization id also associated to the user
        if (!user.Organization.some((org) => org.equals(Organization))) {
            return res.status(400).json({ message: "Organization is not associated to the user" });
        }

        // check if the batch name already exists
        const batch = await BatchModel.find({
            teacherId: user._id,
            name: name,
            Organization: { $in: user.Organization }
        });

        if (batch.length > 0) {
            return res.status(400).json({ message: "Batch name already exists" });
        }
        const batchJoiningCode = Math.floor(1000 + Math.random() * 9000);
        const newBatch = await BatchModel.create({
            name,
            teacherId: user._id,
            batchJoiningCode,
            Organization
        });
        return res.status(201).json({ message: "Batch created successfully", batch: newBatch });
    } catch (error) {
        console.log("Error in createBatch controller: " + error);
        next(error);
    }
})

// add students to the batch by teacher
export const addStudentsByTeacher = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { batchId, studentIds } = req.body;

        if (!batchId) {
            return res.status(400).json({ message: "Batch ID is required" });
        }

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: "At least one student ID is required" });
        }

        const batch = await BatchModel.findById(batchId);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        if (batch.teacherId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to add students to this batch" });
        }

        // check for the students who have same OrganizationIds as batch


        for (const studentId in studentIds) {
            if (mongoose.Types.ObjectId.isValid(studentIds[studentId])) {
                const objectId = new mongoose.Types.ObjectId(studentIds[studentId]);
                const student = await UserModel.findById(objectId);
                if (student) {
                    if (student.role === "student" && student.isVerified && student.Organization.includes(batch.Organization)) {
                        if (!batch.students.includes(student._id)) {
                            batch.students.push(student._id);
                        }
                    }
                }
            } else {
                continue;
            }
        }

        await batch.save();

        return res.status(200).json({ message: "All Valid Students added to batch successfully, Invalid enteries are ignored", batch });

    } catch (error) {
        console.log("Error in addStudentsByTeacher controller: " + error);
        next(error);
    }

})

// add students by entering the batch code
export const addStudentUsingCode = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { batchJoiningCode, batchId } = req.body;


        if (!batchJoiningCode || !batchId) {
            return res.status(400).json({ message: "Batch joining code and batch ID are required" });
        }

        const batch = await BatchModel.findById(batchId);

        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // check if the student and batch are in the same organization
        if (!user.Organization.some((org) => org.equals(batch.Organization))) {
            return res.status(400).json({ message: "You are not authorized to join this batch" });
        }

        if (batch.students.includes(user._id)) {
            return res.status(400).json({ message: "You are already a student of this batch" });
        }

        if (batch.batchJoiningCode !== batchJoiningCode) {
            return res.status(400).json({ message: "Invalid batch joining code" });
        }

        batch.students.push(user._id);
        await batch.save();

        return res.status(200).json({ message: "You are added to the batch successfully" });


    } catch (error) {
        console.log("Error in addStudentUsingCode controller: " + error);
        next(error);
    }
})

// delete student from the batch
export const deleteStudentFromBatch = expressasyncHandler(async (req, res, next) => {
    try {
        const { studentId, batchId } = req.body;
        const user = req.user;

        if (!studentId || !batchId) {
            return res.status(400).json({ message: "Student ID and batch ID are required" });
        }

        const batchToUpdate = await BatchModel.findById(batchId);

        if (!batchToUpdate) {
            return res.status(404).json({ message: "Batch not found" });
        }

        const student = await UserModel.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // check the user is actually the teacher of that batch
        if (batchToUpdate.teacherId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete students from this batch" });
        }

        // check whether the student is in the batch actually
        if (!batchToUpdate.students.includes(studentId)) {
            return res.status(404).json({ message: "Student not found in the batch" });
        }

        // todo: update all the attendance of the student for the perticular batch
        await AttendanceModel.updateMany({
            batchId: batchId,
            "records.studentId": studentId
        }, {
            $pull: {
                records: { studentId: studentId }
            }
        })

        batchToUpdate.students.pull(studentId);
        await batchToUpdate.save();

        return res.status(200).json({ message: "Student deleted from batch successfully" });
    } catch (error) {
        console.log("Error in deleteStudentFromBatch controller: " + error);
        next(error);
    }
})

// get all batches where the teacher exists
export const getAllBatchesForTeacher = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const batches = await BatchModel.find({ teacherId: user._id, Organization: user.Organization })
            .sort({ createdAt: -1 })
            .select("_id name teacherId Organization")
            .populate("teacherId", { name: 1, email: 1 })
        const batchDetails = batches.map((batch) => ({
            ...batch,
            studentCount: batch.students.length
        }))
        return res.status(200).json({ batchDetails });
    } catch (error) {
        console.log("Error in getAllBatchesForTeacher controller: " + error);
        next(error);
    }
})

// get batch info by id for teacher
export const getBatchByIdForTeacher = expressasyncHandler(async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const user = req.user;
        const batch = await BatchModel.find({ _id: batchId, teacherId: user._id, Organization: user.Organization })
            .populate("teacherId", { name: 1, email: 1 })
            .populate("students", { _id: 1, name: 1, email: 1, guardian: 1 });
        return res.status(200).json({ batch });
    } catch (error) {
        console.log("Error in getBatchById controller: " + error);
        next(error);
    }
})

// get batch info by id for student
export const getBatchByIdForStudent = expressasyncHandler(async (req, res, next) => {
    try {
        const { batchId } = req.params;
        const user = req.user;
        const batch = await BatchModel.find({ _id: batchId, Organization: user.Organization })
            .populate("teacherId", { name: 1, email: 1 })
        return res.status(200).json({ batch });
    } catch (error) {
        console.log("Error in getBatchById controller: " + error);
        next(error);
    }
})

// get all the batches where the student exists
export const getAllBatchesForStudent = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const batches = await BatchModel
            .find({ students: { $in: [user._id] }, Organization: user.Organization })
            .select("_id name teacherId Organization students")
            .populate("teacherId", { name: 1, email: 1 })
            .sort({ createdAt: -1 });

        const batchDetails = batches.map((batch) => ({
            ...batch.toJSON(),
            studentCount: batch.students.length
        }))
        return res.status(200).json({ batchDetails });
    } catch (error) {
        console.log("Error in getAllBatchesForStudent controller: " + error);
        next(error);
    }
})

// get all batches of the organization for students only
export const getAllBatchesofOrganization = expressasyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const batches = await BatchModel.find({ Organization: user.Organization })
            .select("_id name teacherId")
            .sort({ createdAt: -1 })
            .populate("teacherId", { name: 1, email: 1 })
        return res.status(200).json({ batches });
    } catch (error) {
        console.log("Error in getAllBatches controller: " + error);
        next(error);
    }
})

// delete batch only by teachers
export const deleteBatch = expressasyncHandler(async (req, res, next) => {
    const { batchId } = req.params;
    const user = req.user;

    if (!batchId) {
        return res.status(400).json({ message: "Batch ID is required" });
    }

    const batch = await BatchModel.findById(batchId);

    if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
    }

    // check the user is actually the teacher of that batch
    if (batch.teacherId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: "You are not authorized to delete this batch" });
    }

    // delete all the attendance of the batch
    await AttendanceModel.deleteMany({ batchId: batchId });

    // delete the batch
    await batch.deleteOne();

    return res.status(200).json({ message: "Batch deleted successfully" });
})
