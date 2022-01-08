var express = require("express");
var router = express.Router();
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { Library, validate, validateEdit } = require("../models/library");
const { User } = require("../models/users");
const { Book } = require("../models/book");
const auth = require("../middleware/auth");
const upload = require("../middleware/multer")("../public/uploads/book_cover/");

router.post(
    "/add",
    [auth, upload.single("coverimage")],
    async (req, res, next) => {
        try {
            const { error } = validate(req.body);
            if (error) return res.status(201).send(error.details[0].message);

            let user = await User.findOne({
                _id: req.user._id,
                type: "publisher",
            });
            if (!user) return res.status(201).send("Publisher Not Found!");
            req.body["publisher"] = req.user._id;
            req.body["coverimage"] = req.file.filename;
            req.body["remainingCopies"] = req.body.copies;
            let library = new Library(
                _.pick(req.body, [
                    "publisher",
                    "bookname",
                    "writername",
                    "coverimage",
                    "description",
                    "edition",
                    "copies",
                    "remainingCopies",
                    "price",
                    "genre",
                    "file",
                ])
            );
            await library.save();
            res.send(library);
        } catch (err) {
            console.log(err.message);
            res.status(500).send(err.message);
        }
    }
);

router.get("/all", auth, async (req, res, next) => {
    try {
        let array = [];
        let library = await Library.find().populate({
            path: "publisher",
            select: "firstname lastname",
        });
        if (library.length == 0)
            return res.status(201).send("No Books available for Purchase");
        for (let i = 0; i < library.length; i++) {
            let obj = _.pick(library[i], [
                "_id",
                "publisher",
                "bookname",
                "writername",
                "coverimage",
                "description",
                "edition",
                "copies",
                "price",
                "genre",
            ]);
            let book = await Book.find({
                library: library[i]._id,
                owner: req.user._id,
            });
            if (book.length == 0) {
                obj["bought"] = false;
            } else {
                obj["bought"] = true;
            }
            array.push(obj);
        }
        res.send(array);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/alllib", async (req, res, next) => {
    try {
        let array = [];
        let library = await Library.find().populate({
            path: "publisher",
            select: "firstname lastname",
        });
        if (library.length == 0)
            return res.status(201).send("No Books available for Purchase");
        for (let i = 0; i < library.length; i++) {
            let obj = _.pick(library[i], [
                "_id",
                "publisher",
                "bookname",
                "writername",
                "coverimage",
                "description",
                "edition",
                "copies",
                "price",
                "genre",
            ]);
            obj["bought"] = false;
            array.push(obj);
        }
        res.send(array);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

// router.get("/:id", async (req, res) => {
//     try {
//         let library = await Library.findById(req.params.id).populate({
//             path: "publisher",
//             select: "firstname lastname",
//         });
//         if (!library) return res.status(201).send("Book Doesn't Exists");
//         library = _.pick(library, [
//             "bookname",
//             "writername",
//             "genre",
//             "price",
//             "publisher",
//             "coverimage",
//         ]);
//         res.send(library);
//     } catch (err) {
//         console.log(err.message);
//         res.status(500).send(err.message);
//     }
// });

router.get("/mybooks", auth, async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.user._id,
            type: "publisher",
        });
        if (!user) return res.status(201).send("Publisher Not Found!");
        let library = await Library.find({ publisher: req.user._id }).populate({
            path: "publisher",
            select: "firstname lastname",
        });
        if (library.length == 0) return res.status(201).send("No Books Found");
        res.send(library);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/edit", [auth, upload.single("coverimage")], async (req, res) => {
    try {
        let library = await Library.findById(req.body._id);
        if (!library) return res.status(201).send("Can't find Book!");

        const { error } = validateEdit(req.body);
        if (error) return res.status(201).send(error.details[0].message);

        if (req.file) {
            if (library.coverimage) {
                fs.unlinkSync(
                    path.join(
                        __dirname,
                        "../public/uploads/book_cover/" + library.coverimage
                    )
                );
            }
        }

        library = await Library.findByIdAndUpdate(
            library.id,
            {
                $set: {
                    bookname: req.body.bookname,
                    writername: req.body.writername,
                    description: req.body.description,
                    price: req.body.price,
                    coverimage: req.file
                        ? req.file.filename
                        : library.coverimage,
                },
            },
            { new: true }
        );

        res.send(library);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
