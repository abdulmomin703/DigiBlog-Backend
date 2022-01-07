const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { join } = require("lodash");

const userSchema = new mongoose.Schema({
    walletaddress: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    lastname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    username: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 255,
        unique: true,
    },
    avatar: {
        type: String,
        required: false,
        Default: null,
    },
    bio: {
        type: String,
        required: false,
        Default: null,
    },
    address: {
        type: String,
        required: false,
        Default: null,
    },
    phonenumber: {
        type: String,
        required: false,
        Default: null,
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
});

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_PRIVATE_KEY);
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
    const schema = Joi.object({
        walletaddress: Joi.string().required(),
        firstname: Joi.string().min(1).max(50).required(),
        lastname: Joi.string().min(1).max(50).required(),
        username: Joi.string().min(1).max(50).required(),
        email: Joi.string().email().required(),
        bio: Joi.string().min(0).max(255),
        phonenumber: Joi.string().min(11).max(11),
        address: Joi.string(),
        avatar: Joi.string(),
        type: Joi.string(),
        status: Joi.number(),
    });
    return schema.validate(user);
}

function validateUserEdit(user) {
    const schema = Joi.object({
        firstname: Joi.string().min(1).max(50).required(),
        lastname: Joi.string().min(1).max(50).required(),
        bio: Joi.string().min(0).max(255),
        avatar: Joi.string(),
    });
    return schema.validate(user);
}

function validateUserCreds(user) {
    const schema = Joi.object({
        walletaddress: Joi.string().required(),
    });
    return schema.validate(user);
}

module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validate = validateUser;
module.exports.validateCreds = validateUserCreds;
module.exports.validateEdit = validateUserEdit;
