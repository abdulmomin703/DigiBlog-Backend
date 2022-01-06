const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");

const librarySchema = new mongoose.Schema({
    publisher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bookname: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    writername: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
    },
    coverimage: {
        type: String,
        required: false,
        Default: null,
    },
    description: {
        type: String,
        required: false,
        Default: null,
    },
    edition: {
        type: Number,
        required: true,
        min: 1,
    },
    copies: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    genre: {
        type: String,
        required: true,
        minLength: 1,
        maxLength: 50,
    },
});

const Library = mongoose.model("Library", librarySchema);

function validateLibrary(library) {
    const schema = Joi.object({
        publisher: Joi.objectId().required(),
        bookname: Joi.string().min(1).max(50).required(),
        writername: Joi.string().min(1).max(50).required(),
        genre: Joi.string().min(1).max(50).required(),
        edition: Joi.number().integer().min(1).required(),
        description: Joi.string().min(0).max(255),
        copies: Joi.number().integer().min(1).required(),
        price: Joi.number().min(0).required(),
        coverimage: Joi.string(),
    });
    return schema.validate(library);
}

function validateLibraryEdit(library) {
    const schema = Joi.object({
        _id: Joi.objectId().required(),
        bookname: Joi.string().min(1).max(50).required(),
        writername: Joi.string().min(1).max(50).required(),
        description: Joi.string().min(0).max(255),
        price: Joi.number().min(0).required(),
        coverimage: Joi.string(),
    });
    return schema.validate(library);
}

module.exports.Library = Library;
module.exports.librarySchema = librarySchema;
module.exports.validate = validateLibrary;
module.exports.validateEdit = validateLibraryEdit;
