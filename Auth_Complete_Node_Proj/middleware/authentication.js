const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;

    if (!token) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
    try {
        const { name, userId, role } = isTokenValid({ token });
        req.user = { name, userId, role };
        next();
    } catch (e) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid");
    }
};

const authorizePermissions = (...rest) => {
    return (req, res, next) => {
        if (!rest.includes(req.user.role)) {
            throw new CustomError.UnauthorizedError(
                "Unauthorized to access this route"
            );
        }
        next();
    };
};

module.exports = {
    authenticateUser,
    authorizePermissions,
};
