import mongoose from "mongoose";

const BatchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    "teacherId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    "students": [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, { timestamps: true });

const BatchModel = mongoose.model("Batch", BatchSchema);

export default BatchModel;