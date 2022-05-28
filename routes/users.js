var express = require("express");
var router = express.Router();
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/multer")(
    "../public/uploads/profile_pictures/"
);

const uploadBlog = require("../middleware/multer")(
    "../public/uploads/blog_pictures/"
);
router.put("/edit", [upload.single("avatar")], async (req, res) => {
    console.log("i am here");
    try {
        console.log(req);
        if (req.file) {
            if (req.body.current_avatar != "") {
                fs.unlinkSync(
                    path.join(
                        __dirname,
                        "../public/uploads/profile_pictures/" +
                            req.body.current_avatar
                    )
                );
            }
        }
        res.send(req.file.filename);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

router.put("/editBlog", [uploadBlog.single("image")], async (req, res) => {
    console.log("i am here");
    try {
        console.log(req);
        if (req.file) {
            if (req.body.current_image != "") {
                fs.unlinkSync(
                    path.join(
                        __dirname,
                        "../public/uploads/blog_pictures/" +
                            req.body.current_avatar
                    )
                );
            }
        }
        res.send(req.file.filename);
    } catch (err) {
        console.log(err.message);
        res.status(500).send(err.message);
    }
});

module.exports = router;
