const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
    offeringUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    offeringBook: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book",
    },
    offeredUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    offeredBook: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Book",
    },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports.Offer = Offer;
module.exports.offerSchema = offerSchema;
