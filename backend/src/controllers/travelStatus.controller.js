import {
    upsertTravelStatusService,
    getAllTravelStatusService,
    getTravelStatusService,
    deleteTravelStatusService,
} from "../services/travelStatus.service.js";

import { successResponse, errorResponse } from "../utils/response.js";

// CREATE or UPDATE
export const upsertTravelStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = req.body;

        const result = await upsertTravelStatusService(userId, data);

        return successResponse(res, result, 200, "Travel status updated");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

// GET ALL
export const getAllTravelStatus = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await getAllTravelStatusService(userId);

        return successResponse(res, result, 200, "All travel status");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

// GET ONE
export const getTravelStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { countryCode } = req.params;

        const result = await getTravelStatusService(userId, countryCode);

        return successResponse(res, result, 200, "Travel status detail");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};

// DELETE
export const deleteTravelStatus = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { countryCode } = req.params;

        const result = await deleteTravelStatusService(userId, countryCode);

        return successResponse(res, result, 200, "Travel status removed");
    } catch (err) {
        return errorResponse(res, err.message, 500);
    }
};
