import expressAsyncHandler from "express-async-handler";

export const createOrganization = expressAsyncHandler(async (req, res, next) => {
    try {
        const { name, adminEmail } = req.body;
    } catch (error) {
        console.log("Error in createOrganization controller: " + error);
        next(error);
    }
})