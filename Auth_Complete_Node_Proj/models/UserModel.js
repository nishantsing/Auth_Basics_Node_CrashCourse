const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"],
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        // match: [
        //     /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        //     "Please provide a valid email",
        // ],
        validate: {
            validator: validator.isEmail,
            message: "Please provide valid email",
        },
        required: [true, "Please provide email"],
        unique: true, // No need we are handling in userController
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minlength: 6,
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },
});

UserSchema.pre("save", async function () {
    // console.log(this.modifiedPaths());
    // console.log(this.isModified("name"));
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
