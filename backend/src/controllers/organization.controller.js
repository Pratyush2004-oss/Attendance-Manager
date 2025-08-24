import expressAsyncHandler from "express-async-handler";
import OrganizationModel from "../models/organization.model.js";

export const createOrganization = expressAsyncHandler(async (req, res, next) => {
    try {
        const { name, adminIds } = req.body;
        if (!name || !adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
            return res.status(400).json({ message: "Name and admin emails are required" });
        }
        const organization = await OrganizationModel.create({
            name,
            adminIds
        });
        return res.status(200).json({ organization });
    } catch (error) {
        console.log("Error in createOrganization controller: " + error);
        next(error);
    }
});

export const getOrganizationList = expressAsyncHandler(async (req, res, next) => {
    try {
        const organizations = await OrganizationModel.find().select("name _id");
        return res.status(200).json({ organizations });
    } catch (error) {
        console.log("Error in getOrganizationList controller: " + error);
        next(error);
    }
});