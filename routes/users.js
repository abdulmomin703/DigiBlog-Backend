var express = require("express");
var router = express.Router();
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const upload = require("../middleware/multer")(
    "../public/uploads/profile_pictures/"
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

module.exports = router;
