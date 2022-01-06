var express = require("express");
var router = express.Router();
const _ = require("lodash");
const { Book } = require("../models/book");
const { Library } = require("../models/library");
const { Offer } = require("../models/offer");
const { User } = require("../models/users");

router.post("/add", async (req, res, next) => {
    try {
        let book1 = await Book.findOne({ _id: req.body.offeringBook });
        if (!book1) return res.status(404).send("Offering Book Doesn't Exists");

        let book2 = await Book.findOne({ _id: req.body.offeredBook });
        if (!book2) return res.status(404).send("Offered Book Doesn't Exists");
        if (book2.status != 0)
            return res.status(404).send("Offered Book Not available for swap");

        let user1 = await User.findOne({
            _id: req.body.offeringUser,
            type: "bookreader",
        });
        if (!user1)
            return res.status(400).send("Offering Bookreader Not Found!");

        let user2 = await User.findOne({
            _id: req.body.offeredUser,
            type: "bookreader",
        });
        if (!user2)
            return res.status(400).send("Offered Bookreader Not Found!");

        let offer = new Offer(
            _.pick(req.body, [
                "offeringUser",
                "offeringBook",
                "offeredUser",
                "offeredBook",
            ])
        );
        await offer.save();
        res.send(offer);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.delete("/delete/:id", async (req, res, next) => {
    try {
        let offer = await Offer.findByIdAndRemove(req.params.id);
        console.log(offer);
        if (!offer) return res.status(400).send("Offer Not Found!");
        res.send("Deleted Successfully");
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        let offers = await Offer.find({ offeredUser: req.params.id })
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
        if (!offers) return res.status(400).send("Offers Not Found!");
        res.send(offers);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
