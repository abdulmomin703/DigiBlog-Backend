var express = require("express");
var router = express.Router();
const _ = require("lodash");
const { Book } = require("../models/book");
const { Library } = require("../models/library");
const { User } = require("../models/users");
const { Offer } = require("../models/offer");
const { Notification } = require("../models/notifcation");
const auth = require("../middleware/auth");

router.post("/buy", auth, async (req, res, next) => {
    try {
        let library = await Library.findOne({ _id: req.body.library });
        if (!library) return res.status(201).send("Book Doesn't Exists");
        if (library.remainingCopies == 0)
            return res.status(201).send("Book out of Stock.");
        let user = await User.findOne({
            _id: req.user._id,
            type: "bookreader",
        });
        if (!user) return res.status(201).send("Bookreader Not Found!");
        req.body["owner"] = req.user._id;
        let book = new Book(_.pick(req.body, ["library", "owner", "status"]));
        await book.save();
        library = await Library.findByIdAndUpdate(
            library.id,
            {
                $set: {
                    remainingCopies: library.remainingCopies - 1,
                },
            },
            { new: true }
        );
        // let msg =
        //     offeredUser.username +
        //     " bought your book " +
        //     offeredBook.library.bookname +
        //     ". The remaining number of copies are " +
        //     offeredBook.library.remainingCopies +
        //     ".";
        let notification = new Notification({
            user: library.publisher,
            offeredUser: req.user._id,
            offeredBook: book.id,
            status: 1,
            type: 3,
        });
        await notification.save();

        res.send(book);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/putonswap", auth, async (req, res, next) => {
    try {
        let book = await Book.findById(req.body._id);
        if (!book) return res.status(201).send("Book Doesn't Exists");
        if (book.owner != req.user._id)
            return res
                .status(201)
                .send(
                    "You don't own this book anymore. Please refresh the page."
                );
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

router.put("/removefromswap", auth, async (req, res, next) => {
    try {
        let book = await Book.findById(req.body._id);
        if (!book) return res.status(201).send("Book Doesn't Exists");
        if (book.owner != req.user._id)
            return res
                .status(201)
                .send(
                    "You don't own this book anymore. Please refresh the page."
                );
        book = await Book.findByIdAndUpdate(
            book.id,
            {
                $set: {
                    status: 1,
                },
            },
            { new: true }
        );
        let offers = await Offer.find({ offeredBook: req.body._id });

        for (let i = 0; i < offers.length; i++) {
            // let msg =
            //     "The " +
            //     offers[i].offeredBook.library.bookname +
            //     " book is no longer available for swap";
            let notification = new Notification({
                user: offers[i].offeringUser,
                offeredBook: offers[i].offeredBook,
                status: 1,
                type: 1,
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

router.get("/mybooks", auth, async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.user._id,
            type: "bookreader",
        });
        if (!user) return res.status(201).send("Bookreader Not Found!");
        let books = await Book.find({ owner: req.user._id }).populate({
            path: "library",
            populate: [{ path: "publisher", select: "firstname lastname" }],
        });
        if (books.length == 0) return res.status(201).send("No Books Found");
        res.send(books);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/swap", auth, async (req, res, next) => {
    try {
        let book1 = await Book.findById(req.body.book1);
        if (!book1) return res.status(201).send("Book1 Doesn't Exists");
        let book2 = await Book.findById(req.body.book2);
        if (!book2) return res.status(201).send("Book2 Doesn't Exists");
        let offer = await Offer.findById(req.body.offer);
        if (!offer) return res.status(201).send("Offer Expired.");
        if (offer.offeredUser.equals(book1.owner) != true) {
            await Offer.deleteMany({ _id: req.body.offer });
            return res.status(201).send("Offer Expired.");
        }
        if (offer.offeringUser.equals(book2.owner) != true) {
            await Offer.deleteMany({ _id: req.body.offer });
            return res.status(201).send("Offer Expired.");
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

        // let msg =
        //     user.username +
        //     " accepted your offer to swap his" +
        //     library1.bookname +
        //     " book with your " +
        //     library2.bookname +
        //     " book.";
        let notification = new Notification({
            user: book1.owner,
            offeredUser: book2.owner,
            offeredBook: book1.id,
            offeringBook: book2.id,
            type: 2,
            status: 1,
        });
        await notification.save();
        let offers = await Offer.find({
            offeredBook: req.body.book1,
            offeringUser: { $ne: book1.owner },
        });

        for (let i = 0; i < offers.length; i++) {
            // let msg =
            //     "The " +
            //     offers[i].offeredBook.library.bookname +
            //     " book is no longer available for swap";
            let notification = new Notification({
                user: offers[i].offeringUser,
                offeredBook: offers[i].offeredBook,
                status: 1,
                type: 1,
            });
            await notification.save();
        }
        await Offer.deleteMany({ offeredBook: req.body.book1 });

        offers = await Offer.find({
            offeredBook: req.body.book2,
            offeringUser: { $ne: book2.owner },
        });

        for (let i = 0; i < offers.length; i++) {
            // let msg =
            //     "The " +
            //     offers[i].offeredBook.library.bookname +
            //     " book is no longer available for swap";
            let notification = new Notification({
                user: offers[i].offeringUser,
                offeredBook: offers[i].offeredBook,
                status: 1,
                type: 1,
            });
            await notification.save();
        }
        await Offer.deleteMany({ offeredBook: req.body.book2 });

        res.send([book1, book2]);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/viewswap", auth, async (req, res, next) => {
    try {
        let array = [];
        let books = await Book.find({
            status: 0,
            owner: { $ne: req.user._id },
        })
            .populate({
                path: "library",
                populate: [{ path: "publisher", select: "firstname lastname" }],
            })
            .populate({
                path: "owner",
                select: "username",
            });

        if (books.length == 0)
            return res.status(201).send("No Books available for Swap");
        for (let i = 0; i < books.length; i++) {
            let book = await Book.find({
                owner: req.user_id,
                library: books[i].library,
            });
            if (!book) {
                let obj = _.pick(books[i], [
                    "_id",
                    "library",
                    "owner",
                    "status",
                ]);
                let offer = await Offer.find({
                    offeringUser: req.user._id,
                    offeredBook: books[i].id,
                });
                if (offer.length == 0) {
                    obj["offer"] = false;
                } else {
                    obj["offer"] = true;
                }
                array.push(obj);
            }
        }
        res.send(array);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/viewswapall", async (req, res, next) => {
    try {
        let array = [];
        let books = await Book.find({
            status: 0,
        })
            .populate({
                path: "library",
                populate: [{ path: "publisher", select: "firstname lastname" }],
            })
            .populate({
                path: "owner",
                select: "username",
            });
        if (books.length == 0)
            return res.status(404).send("No Books available for Swap");
        for (let i = 0; i < books.length; i++) {
            let obj = _.pick(books[i], ["_id", "library", "owner", "status"]);
            obj["offer"] = false;
            array.push(obj);
        }
        res.send(array);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
