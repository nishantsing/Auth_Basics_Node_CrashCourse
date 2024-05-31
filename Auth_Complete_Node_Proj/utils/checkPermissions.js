const CustomError = require("../errors");

// To check the permission if admin then on he can view other users, no other user can view other user using getSingleUser route and passing id
const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin") return; // continue and send res
    if (requestUser.userId === resourceUserId.toString()) return; // continue and send res
    throw new CustomError.UnauthorizedError(
        "Not authorized to access this user"
    );
};

module.exports = checkPermissions;
