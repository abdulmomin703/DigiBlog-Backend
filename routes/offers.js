var express = require("express");
var router = express.Router();
const _ = require("lodash");
const auth = require("../middleware/auth");
const { Book } = require("../models/book");
const { Notification } = require("../models/notifcation");
const { Offer } = require("../models/offer");
const { User } = require("../models/users");

router.post("/add", auth, async (req, res, next) => {
    try {
        let book1 = await Book.findOne({ _id: req.body.offeringBook });
        if (!book1) return res.status(201).send("Offering Book Doesn't Exists");

        let book2 = await Book.findOne({ _id: req.body.offeredBook });
        if (!book2) return res.status(201).send("Offered Book Doesn't Exists");
        if (book2.status != 0)
            return res.status(201).send("Offered Book Not available for swap");

        let user1 = await User.findOne({
            _id: req.user._id,
            type: "bookreader",
        });
        if (!user1)
            return res.status(201).send("Offering Bookreader Not Found!");

        let user2 = await User.findOne({
            _id: book2.owner,
            type: "bookreader",
        });
        if (!user2)
            return res.status(201).send("Offered Bookreader Not Found!");
        req.body["offeringUser"] = req.user._id;
        req.body["offeredUser"] = book2.owner;
        console.log(req.body);
        let offer = new Offer(
            _.pick(req.body, [
                "offeringUser",
                "offeringBook",
                "offeredUser",
                "offeredBook",
            ])
        );
        await offer.save();
        // let msg =
        //     req.body.offeringUser +
        //     " made an offer to swap " +
        //     req.body.offeringBook +
        //     " with " +
        //     req.body.offeredBook +
        //     ".";
        let notification = new Notification({
            user: req.body.offeredUser,
            offeredUser: req.body.offeringUser,
            offeredBook: req.body.offeredBook,
            offeringBook: req.body.offeringBook,
            type: 4,
            status: 1,
        });
        await notification.save();
        res.send(offer);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.delete("/:id", auth, async (req, res, next) => {
    try {
        let offer = await Offer.findByIdAndRemove(req.params.id);
        console.log(offer);
        if (!offer) return res.status(201).send("Offer Not Found!");
        // let msg =
        //     req.user._id +
        //     " rejected your offer to swap " +
        //     offer.offeredBook +
        //     " with " +
        //     offer.offeringBook +
        //     ".";
        let notification = new Notification({
            user: offer.offeringUser,
            offeredUser: req.user._id,
            offeredBook: offer.offeredBook,
            offeringBook: offer.offeringBook,
            type: 5,
            status: 1,
        });
        await notification.save();
        res.send("Deleted Successfully");
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/getOffers", auth, async (req, res, next) => {
    try {
        let offers = await Offer.find({ offeredUser: req.user._id })
            .populate({
                path: "offeredUser",
                select: "username",
            })
            .populate({
                path: "offeringUser",
                select: "username",
            })
            .populate({
                path: "offeredBook",
                populate: [
                    {
                        path: "library",
                        populate: [
                            { path: "publisher", select: "firstname lastname" },
                        ],
                    },
                ],
            })
            .populate({
                path: "offeringBook",
                populate: [
                    {
                        path: "library",
                        populate: [
                            { path: "publisher", select: "firstname lastname" },
                        ],
                    },
                ],
            });
        if (!offers) return res.status(201).send("Offers Not Found!");
        res.send(offers);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
