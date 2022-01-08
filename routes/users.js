var express = require("express");
var router = express.Router();
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const {
    User,
    validate,
    validateCreds,
    validateEdit,
} = require("../models/users");
const { Book } = require("../models/book");
const auth = require("../middleware/auth");
const { use } = require("express/lib/router");
const { Library } = require("../models/library");
const upload = require("../middleware/multer")(
    "../public/uploads/profile_pictures/"
);
router.post("/signup", async (req, res, next) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(201).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(201).send("Email Already Used!");

        user = await User.findOne({
            walletaddress: req.body.walletaddress,
        });
        if (user) return res.status(201).send("Wallet Already Used!");

        user = await User.findOne({ username: req.body.username });
        if (user) return res.status(201).send("Username already Used!");

        user = new User(
            _.pick(req.body, [
                "walletaddress",
                "firstname",
                "lastname",
                "username",
                "email",
                "avatar",
                "bio",
                "address",
                "phonenumber",
                "type",
                "status",
            ])
        );

        await user.save();

        const token = { token: user.generateAuthToken(), user: user, books: 0 };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/signin", async (req, res, next) => {
    try {
        const { error } = validateCreds(req.body);
        if (error) return res.status(201).send(error.details[0].message);

        let user = await User.findOne({
            walletaddress: req.body.walletaddress,
        });
        if (!user) return res.status(201).send("User Doesn't Exists1");
        let length = 0;
        if (user.type == "bookreader") {
            let book = await Book.find({ owner: user.id });
            length = book.length;
        } else if (user.type == "publisher") {
            let library = await Library.find({ publisher: user.id });
            length = library.length;
        }
        if (user.status == 0)
            return res.status(201).send("Account Deactivated");
        const token = {
            token: user.generateAuthToken(),
            user: user,
            books: length,
        };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/edit", [auth, upload.single("avatar")], async (req, res) => {
    console.log("i am here");
    try {
        let user = await User.findById(req.user._id);
        if (!user) return res.status(201).send("Can't find User!");

        const { error } = validateEdit(req.body);
        if (error) return res.status(201).send(error.details[0].message);

        if (req.file) {
            if (user.avatar) {
                fs.unlinkSync(
                    path.join(
                        __dirname,
                        "../public/uploads/profile_pictures/" + user.avatar
                    )
                );
            }
        }

        user = await User.findByIdAndUpdate(
            user.id,
            {
                $set: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    bio: req.body.bio,
                    avatar: req.file ? req.file.filename : user.avatar,
                },
            },
            { new: true }
        );

        res.send(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/publisher/:id", async (req, res) => {
    try {
        let user = await User.findOne({
            _id: req.params.id,
            type: "publisher",
        });
        if (!user) return res.status(201).send("Can't find User!");
        let name = user.firstname + " " + user.lastname;
        res.send(name);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
