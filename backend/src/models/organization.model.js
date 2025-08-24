import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    adminIds: [
        {
            type: String,
            required: true
        }
    ]
})

const OrganizationModel = mongoose.model("Organization", OrganizationSchema);

export default OrganizationModel;