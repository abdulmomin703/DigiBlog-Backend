var express = require("express");
var router = express.Router();
const _ = require("lodash");
const { Library, validate, validateEdit } = require("../models/library");
const { User } = require("../models/users");
const { Book } = require("../models/book");

router.post("/add", async (req, res, next) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ _id: req.body.publisher });
        if (!user) return res.status(400).send("User Not Found!");
        console.log(user);
        let library = new Library(
            _.pick(req.body, [
                "publisher",
                "bookname",
                "writername",
                "coverimage",
                "description",
                "edition",
                "copies",
                "price",
                "genre",
            ])
        );

        await library.save();

        res.send(library);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/all/:id", async (req, res, next) => {
    try {
        let array = [];
        let library = await Library.find();
        if (library.length == 0)
            return res.status(404).send("No Books available for Purchase");
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
                owner: req.params.id,
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

router.get("/:id", async (req, res) => {
    try {
        let library = await Library.findById(req.params.id).populate({
            path: "publisher",
            select: "firstname lastname",
        });
        if (!library) return res.status(404).send("Book Doesn't Exists");
        library = _.pick(library, [
            "bookname",
            "writername",
            "genre",
            "price",
            "publisher",
            "coverimage",
        ]);
        res.send(library);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/mybooks/:id", async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.params.id,
            type: "publisher",
        });
        if (!user) return res.status(400).send("Publisher Not Found!");
        let library = await Library.find({ publisher: req.params.id });
        if (library.length == 0) return res.status(404).send("No Books Found");
        res.send(library);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

// //router.put("/edit", [auth, upload.single("avatar")], async (req, res) => {

router.put("/edit", async (req, res) => {
    console.log(req);
    try {
        let library = await Library.findById(req.body._id);
        if (!library) return res.status(400).send("Can't find Library!");

        const { error } = validateEdit(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // if (req.file) {
        //     if (user.avatar) {
        //         fs.unlinkSync(
        //             path.join(
        //                 __dirname,
        //                 "../public/uploads/profile_pictures/" + user.avatar
        //             )
        //         );
        //     }
        // }

        library = await Library.findByIdAndUpdate(
            library.id,
            {
                $set: {
                    bookname: req.body.bookname,
                    writername: req.body.writername,
                    description: req.body.description,
                    price: req.body.price,
                    coverimage: req.body.coverimage,
                    // avatar: req.file ? req.file.filename : user.avatar,
                },
            },
            { new: true }
        );

        res.send(
            _.pick(library, [
                "bookname",
                "writername",
                "description",
                "price",
                "coverimage",
            ])
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
