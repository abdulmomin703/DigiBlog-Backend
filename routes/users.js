var express = require("express");
var router = express.Router();
const _ = require("lodash");
const {
    User,
    validate,
    validateCreds,
    validateEdit,
} = require("../models/users");

router.post("/signup", async (req, res, next) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("Email Already Used!");

        user = await User.findOne({
            walletaddress: req.body.walletaddress,
        });
        if (user) return res.status(400).send("Wallet Already Used!");

        user = await User.findOne({ username: req.body.username });
        if (user) return res.status(400).send("Username already Used!");

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

        const token = { token: user.generateAuthToken(), user: user };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.post("/signin", async (req, res, next) => {
    try {
        const { error } = validateCreds(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({
            walletaddress: req.body.walletaddress,
        });
        if (!user) return res.status(400).send("User Doesn't Exists");
        if (user.status == 0)
            return res.status(400).send("Account Deactivated");
        const token = {
            token: user.generateAuthToken(),
            user: user,
        };
        res.send(token);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User Doesn't Exists");
        user = _.pick(user, [
            "firstname",
            "lastname",
            "username",
            "email",
            "avatar",
            "bio",
        ]);
        res.send(user);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

//router.put("/edit", [auth, upload.single("avatar")], async (req, res) => {

router.put("/edit", async (req, res) => {
    console.log(req);
    try {
        let user = await User.findById(req.body._id);
        if (!user) return res.status(400).send("Can't find User!");

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

        user = await User.findByIdAndUpdate(
            user.id,
            {
                $set: {
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    bio: req.body.bio,
                    avatar: req.body.avatar,
                    // avatar: req.file ? req.file.filename : user.avatar,
                },
            },
            { new: true }
        );

        res.send(
            _.pick(user, [
                "firstname",
                "lastname",
                "username",
                "email",
                "avatar",
                "bio",
            ])
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
