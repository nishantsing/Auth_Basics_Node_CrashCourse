const {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
} = require("../controllers/userController");
const {
    authenticateUser,
    authorizePermissions,
} = require("../middleware/authentication");
const express = require("express");
const router = express.Router();

router
    .route("/")
    .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").post(authenticateUser, updateUser);
router.route("/updateUserPassword").post(authenticateUser, updateUserPassword);

router.route("/:id").get(authenticateUser, getSingleUser); //id one needs to be in bottom, will create issue for /showMe

module.exports = router;
