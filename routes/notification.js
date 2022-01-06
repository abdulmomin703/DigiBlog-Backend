var express = require("express");
var router = express.Router();
const _ = require("lodash");
const { User } = require("../models/users");
const { notification, Notification } = require("../models/notifcation");
router.post("/add", async (req, res, next) => {
    try {
        let user = await User.findOne({
            _id: req.body.user,
        });
        if (!user) return res.status(400).send("User Not Found!");

        let notification = new Notification(
            _.pick(req.body, ["user", "message", "status"])
        );
        await notification.save();
        res.send(notification);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        let notifications = await Notification.find({ user: req.params.id });
        if (notifications.length == 0)
            return res.status(400).send("Notifications Not Found!");
        res.send(notifications);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/status", async (req, res, next) => {
    try {
        let notification = await Notification.findById(req.body.id);
        if (!notification)
            return res.status(400).send("Notification Not Found!");
        notification = await Notification.findByIdAndUpdate(
            notification.id,
            {
                $set: {
                    status: 0,
                },
            },
            { new: true }
        );
        res.send(notification);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
