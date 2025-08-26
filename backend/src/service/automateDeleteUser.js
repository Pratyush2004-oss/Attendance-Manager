import UserModel from "../models/auth.model.js";
export const AutomateDeleteUser = async () => {
    await UserModel.deleteMany({
        // Only delete users who were created more than 10 days ago
        // The $lt operator is used to specify a date range
        // Date.now() returns the current timestamp, and we subtract 10 days worth of milliseconds
        createdAt: { $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        // Only delete teachers who are not isTeacherVerified
        $or: [
            // Only delete teachers who are not isTeacherVerified
            { role: "teacher", isTeacherVerified: false, isVerified: true },
            // Only delete users who have not verified their account
            { isVerified: false }
        ]
    })
        // Use the then block to execute code after the deletion operation is complete
        .then(() => {
            console.log("Deleted users older than 10 days");
        });
}