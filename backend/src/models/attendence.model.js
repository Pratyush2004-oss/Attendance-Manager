import mongoose from 'mongoose';

const AttendenceSchema = new mongoose.Schema({
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
    record: [
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

const AttendenceModel = mongoose.model("Attendence", AttendenceSchema);

export default AttendenceModel;