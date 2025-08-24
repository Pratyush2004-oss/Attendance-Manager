import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true
    },
    records: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            status: {
                type: String,
                enum: ['present', 'absent', 'leave'],
                required: true
            }
        }
    ]
}, { timestamps: true });

const AttendanceModel = mongoose.model("Attendance", AttendanceSchema);

export default AttendanceModel;