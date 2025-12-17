import UserCountryStatus from "../models/UserCountryStatus.js";
import Country from '../models/Country.js';

export const upsertTravelStatusService = async (userId, data) => {
    const { cca3, status, note, startDate, endDate } = data;

    const country = await Country.findOne({ cca3 }).select('name');

    const result = await UserCountryStatus.findOneAndUpdate(
        { userId, cca3 },
        {
            $set: { status, note, startDate, endDate, name: country.name?.common },
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

export const getTravelStatusService = async (userId, cca3) => {
    return await UserCountryStatus.findOne({ userId, cca3 }).lean();
};

export const deleteTravelStatusService = async (userId, cca3) => {
    return await UserCountryStatus.findOneAndDelete({ userId, cca3 });
};