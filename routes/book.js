var express = require("express");
var router = express.Router();
const _ = require("lodash");
const { Book } = require("../models/book");
const { Library } = require("../models/library");
const { User } = require("../models/users");
const { Offer } = require("../models/offer");
const { Notification } = require("../models/notifcation");

router.post("/buy", async (req, res, next) => {
    try {
        let library = await Library.findOne({ _id: req.body.library });
        if (!library) return res.status(404).send("Library Doesn't Exists");
        let user = await User.findOne({
            _id: req.body.owner,
            type: "bookreader",
        });
        if (!user) return res.status(400).send("Bookreader Not Found!");
        let book = new Book(_.pick(req.body, ["library", "owner", "status"]));
        await book.save();
        library = await Library.findByIdAndUpdate(
            library.id,
            {
                $set: {
                    copies: library.copies - 1,
                },
            },
            { new: true }
        );
        let msg =
            user.username +
            " bought your book " +
            library.bookname +
            ". The remaining number of copies are " +
            library.copies +
            ".";
        let notification = new Notification({
            user: library.publisher,
            message: msg,
            status: 1,
        });
        await notification.save();

        res.send(book);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/putonswap", async (req, res, next) => {
    try {
        let book = await Book.findById(req.body._id);
        if (!book) return res.status(404).send("Book Doesn't Exists");
        book = await Book.findByIdAndUpdate(
            book.id,
            {
                $set: {
                    status: 0,
                },
            },
            { new: true }
        );
        res.send(book);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/removefromswap", async (req, res, next) => {
    try {
        let book = await Book.findById(req.body._id);
        if (!book) return res.status(404).send("Book Doesn't Exists");
        book = await Book.findByIdAndUpdate(
            book.id,
            {
                $set: {
                    status: 1,
                },
            },
            { new: true }
        );
        let offers = await Offer.find({ offeredBook: req.body._id })
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

        for (let i = 0; i < offers.length; i++) {
            let msg =
                "The " +
                offers[i].offeredBook.library.bookname +
                " book is no longer available for swap";
            let notification = new Notification({
                user: offers[i].offeringUser,
                message: msg,
                status: 1,
            });
            await notification.save();
        }
        await Offer.deleteMany({ offeredBook: req.body._id });
        res.send(book);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/mybooks/:id", async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.params.id,
            type: "bookreader",
        });
        if (!user) return res.status(400).send("Bookreader Not Found!");
        let books = await Book.find({ owner: req.params.id });
        if (books.length == 0) return res.status(404).send("No Books Found");
        res.send(books);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/swap", async (req, res, next) => {
    try {
        let book1 = await Book.findById(req.body.book1);
        if (!book1) return res.status(404).send("Book1 Doesn't Exists");
        let book2 = await Book.findById(req.body.book2);
        if (!book2) return res.status(404).send("Book2 Doesn't Exists");
        let offer = await Offer.findById(req.body.offer);
        if (!offer) return res.status(404).send("Offer Expired.");
        if (offer.offeredUser.equals(book1.owner) != true) {
            await Offer.deleteMany({ _id: req.body.offer });
            return res.status(404).send("Offer Expired.");
        }
        if (offer.offeringUser.equals(book2.owner) != true) {
            await Offer.deleteMany({ _id: req.body.offer });
            return res.status(404).send("Offer Expired.");
        }

        let temp = book1.owner;
        book1 = await Book.findByIdAndUpdate(
            book1.id,
            {
                $set: {
                    owner: book2.owner,
                    status: 1,
                },
            },
            { new: true }
        );
        book2 = await Book.findByIdAndUpdate(
            book2.id,
            {
                $set: {
                    owner: temp,
                    status: 1,
                },
            },
            { new: true }
        );
        let user = await User.findById(book1.owner);
        let library1 = await Library.findById(book1.library);
        let library2 = await Library.findById(book2.library);
        let msg =
            user.username +
            " accepted your offer to swap his" +
            library1.bookname +
            " book with your " +
            library2.bookname +
            " book.";
        library2.bookname + ".";
        let notification = new Notification({
            user: book2.owner,
            message: msg,
            status: 1,
        });
        await notification.save();
        await Offer.deleteMany({ offeredBook: req.body.book1 });
        await Offer.deleteMany({ offeredBook: req.body.book2 });
        res.send([book1, book2]);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/viewswap/:id", async (req, res, next) => {
    try {
        let array = [];
        let books = await Book.find({
            status: 0,
            owner: { $ne: req.params.id },
        })
            .populate({
                path: "library",
                select: "coverimage price",
            })
            .populate({
                path: "owner",
                select: "username",
            });

        if (books.length == 0)
            return res.status(404).send("No Books available for Swap");
        for (let i = 0; i < books.length; i++) {
            let obj = _.pick(books[i], ["_id", "library", "owner", "status"]);
            let offer = await Offer.find({
                offeringUser: req.params.id,
                offeredBook: books[i].id,
            });
            if (offer.length == 0) {
                obj["offer"] = false;
            } else {
                obj["offer"] = true;
            }
            array.push(obj);
        }
        res.send(array);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
