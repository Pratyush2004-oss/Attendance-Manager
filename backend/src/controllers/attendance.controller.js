import expressAsyncHandler from "express-async-handler";
import BatchModel from "../models/batches.model.js";
import AttendanceModel from "../models/attendance.model.js";

/**
 * @desc    Create or update a full day's attendance for a batch.
 * @route   POST /api/attendance/mark
 * @access  Private (Teacher)
 * @body    { "batchId": "...", "date": "YYYY-MM-DD", "records": [{ "studentId": "...", "status": "present" }, ...] }
 */

// Here teacher will mark the Attandance of all the students of the periticular batch of the given date 
export const markAttendance = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { date, batchId, records } = req.body;
        // START DEBUGGING HERE
        console.log('Received request body:', JSON.stringify(req.body, null, 2));
        if (!batchId || !date || !records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ message: "BatchId , Date and records are required" })
        }

        // Prevent marking attendance on Sundays
        const attendanceDate = new Date(date);
        if (attendanceDate.getDay() === 0) { // 0 represents Sunday
            return res.status(400).json({ error: "Cannot mark attendance on Sundays" });
        }

        // check for the batch if it exists
        const batch = await BatchModel.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // check if the current user is the teacher of that batch or not
        if (batch.teacherId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to mark attendance for this batch" });
        }

        // 4. Normalize date to midnight for consistent database queries
        const startOfDay = new Date(attendanceDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        // check if the record have duplicate studentIds
        const studentIds = records.map(record => record.studentId);
        const duplicateStudentIds = studentIds.filter((studentId, index) => studentIds.indexOf(studentId) !== index);
        if (duplicateStudentIds.length > 0) {
            return res.status(400).json({ message: `Duplicate studentIds: ${duplicateStudentIds.join(", ")}` });
        }

        // check if the records and batch are of same length
        if (records.length !== batch.students.length) {
            return res.status(400).json({ message: "Exact number of students in the attendance are required" });
        }

        // check whether all the studentIds are in the batch or not
        const invalidStudentIds = studentIds.filter(studentId => !batch.students.includes(studentId));
        if (invalidStudentIds.length > 0) {
            return res.status(400).json({ message: `Invalid studentIds: ${invalidStudentIds.join(", ")}` });
        }

        const attendanceDocument = await AttendanceModel.findOneAndUpdate(
            {
                batchId: batchId,
                date: startOfDay,
            },
            {
                // $set will replace the value of a field with the specified value
                $set: {
                    batchId: batchId,
                    date: startOfDay,
                    records: records,
                },
            },
            {
                new: true,          // Return the updated document
                upsert: true,       // Create the document if it doesn't exist
                runValidators: true,
            }
        );
        res.status(201).json({
            message: 'Attendance recorded successfully.',
            data: attendanceDocument,
        });
    } catch (error) {
        console.log("Error in mark-Attendance controller: " + error);
        next(error);
    }
})

// update attendance of perticular student of the perticular batch
export const updateAttendanceofPerticularStudent = expressAsyncHandler(async (req, res, next) => {
    try {
        const { studentId, batchId, date, status } = req.body;
        const user = req.user;

        if (!studentId || !batchId || !date || !status) {
            return res.status(400).json({ message: "StudentId, BatchId, Date and Status are required" });
        }

        // check for the batch if it exists
        const batch = await BatchModel.findById(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // check whether the current user is the teacher of the perticular batch or not
        if (batch.teacherId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update attendance for this batch" });
        }

        // check if the student is the student of the perticular batch
        if (!batch.students.includes(studentId)) {
            return res.status(404).json({ message: "Student not found in the batch" });
        }

        // 4. Normalize date to midnight for consistent database queries
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        // check that the attendance was there in the perticular date
        const attendance = await AttendanceModel.findOne({ batchId, date: startOfDay });
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }

        // update the attendance
        const updatedAttendance = await AttendanceModel.findOneAndUpdate(
            {
                batchId: batchId,
                date: startOfDay,
                "records.studentId": studentId,
            },
            {
                $set: {
                    "records.$.status": status,
                },
            },
            {
                new: true,          // Return the updated document
                upsert: true,       // Create the document if it doesn't exist
                runValidators: true,
            }
        );
        res.status(200).json({
            message: 'Attendance updated successfully.',
            data: updatedAttendance,
        });

    } catch (error) {
        console.log("Error in update-Attendance-of-perticular-student controller: " + error);
        next(error);
    }

})

// get attendance of all the students of that batch of the perticular date
export const getAttendanceofAllStudents = expressAsyncHandler(async (req, res, next) => {
    const { batchId, date } = req.body;

    if (!batchId || !date) {
        return res.status(400).json({ message: "BatchId and Date are required" });
    }

    try {
        const attendance = await AttendanceModel.findOne({ batchId, date })
            .select("records batchId date")
            .populate('records.studentId', "name")
            .populate("batchId", "name");
        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }
        return res.status(200).json({ attendance });
    } catch (error) {
        console.log("Error in getAttendanceofAllStudents controller: " + error);
        next(error);
    }
})

// get the batch info and attendace of the student for the perticular month
export const getAttendanceForStudent = expressAsyncHandler(async (req, res, next) => {
    try {
        const user = req.user;
        const { month } = req.params;

        if (!month) {
            return res.status(400).json({ message: "Month is required" });
        }

        // get the attendance of the student for the month
        // Use the AttendanceModel to aggregate the attendance data
        const attendance = await AttendanceModel.aggregate([
            // Match the attendance records for the given month and student
            {
                $match: {
                    date: {
                        $gte: new Date(`${month}-01`), // Start of the month
                        $lt: new Date(`${month}-31`), // End of the month
                        $exists: true, // Ensure the date field exists
                    },
                    "records.studentId": user._id, // Match the student ID
                },
            },

            // Unwind the records array to process each record individually
            {
                $unwind: "$records",
            },

            // Match the student ID again to ensure we only get records for the current student
            {
                $match: {
                    "records.studentId": user._id,
                },
            },

            // Group the attendance records by batch ID
            {
                $group: {
                    _id: "$batchId", // Group by batch ID
                    attendanceRecords: {
                        $push: {
                            date: "$date", // Add the date to the attendance records
                            status: "$records.status", // Add the status to the attendance records
                        },
                    },
                    presentDays: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$records.status", "present"] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    absentDays: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$records.status", "absent"] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    leaveDays: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$records.status", "leave"] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                },
            },

            // Lookup the batch details from the batches collection
            {
                $lookup: {
                    from: "batches", // Collection name
                    localField: "_id", // Field to match in the attendance collection
                    foreignField: "_id", // Field to match in the batches collection
                    as: "batchDetails", // Store the batch details in an array
                },
            },

            // Project the required fields
            {
                $project: {
                    _id: 1, // Exclude the _id field
                    attendanceRecords: 1, // Project the attendance records
                    batchName: { $arrayElemAt: ["$batchDetails.name", 0] }, // Extract the batch name from the batch details
                    presentDays: 1, // Project the present days
                    absentDays: 1, // Project the absent days
                    leaveDays: 1, // Project the leave days
                },
            },
        ]);

        if (!attendance) {
            return res.status(404).json({ message: "Attendance not found" });
        }

        // now I want to count the attendance of the students
        // Count the number of days the student was absent, present, and on leave
        const attendanceSummary = attendance.map((batch) => {
            const absentDays = batch.attendanceRecords.filter((record) => record.status === "absent").length;
            const presentDays = batch.attendanceRecords.filter((record) => record.status === "present").length;
            const leaveDays = batch.attendanceRecords.filter((record) => record.status === "leave").length;

            return {
                batchId: batch.batchId,
                batchName: batch.batchName,
                absentDays,
                presentDays,
                leaveDays,
            };
        });



        return res.status(200).json({ attendanceSummary, attendance });
    } catch (error) {
        console.log("Error in getAttendanceForStudent controller: " + error);
        next(error);
    }
})






