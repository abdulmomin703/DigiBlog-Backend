const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    message: {
        type: String,
        required: true,
        maxlength: 255,
    },
    status: {
        type: Number,
        required: true,
    },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports.Notification = Notification;
module.exports.notificationSchema = notificationSchema;
