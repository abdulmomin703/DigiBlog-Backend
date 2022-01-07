const express = require("express");

module.exports = function (app) {
    app.use(
        "/public/uploads/profile_pictures",
        express.static("public/uploads/profile_pictures")
    );
    app.use(
        "/public/uploads/book_cover",
        express.static("public/uploads/book_cover")
    );
};
