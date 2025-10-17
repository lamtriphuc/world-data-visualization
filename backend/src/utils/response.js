export const successResponse = (res, data, status = 200, message = "Success") => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};

export const errorResponse = (res, message, status = 500) => {
    return res.status(status).json({
        success: false,
        message,
    });
};
