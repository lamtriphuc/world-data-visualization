import UserCountryStatus from "../models/UserCountryStatus.js";

export const upsertTravelStatusService = async (userId, data) => {
    const { countryCode, status, note, startDate, endDate } = data;

    const result = await UserCountryStatus.findOneAndUpdate(
        { userId, countryCode },
        {
            $set: { status, note, startDate, endDate },
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
        }
    );

    return result;
};

export const getAllTravelStatusService = async (userId) => {
    return await UserCountryStatus.find({ userId }).lean();
};

export const getTravelStatusService = async (userId, countryCode) => {
    return await UserCountryStatus.findOne({ userId, countryCode }).lean();
};

export const deleteTravelStatusService = async (userId, countryCode) => {
    return await UserCountryStatus.findOneAndDelete({ userId, countryCode });
};