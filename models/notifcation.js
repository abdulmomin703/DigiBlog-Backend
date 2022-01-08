const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        offeredBook: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "Book",
        },
        offeredUser: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "User",
        },
        offeringBook: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: "Book",
        },
        type: {
            type: Number,
            required: true,
        },
        status: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports.Notification = Notification;
module.exports.notificationSchema = notificationSchema;
