const morgan = require("morgan");
const express = require("express");

const user = require("../routes/users");
const library = require("../routes/library");
const book = require("../routes/book");
const offer = require("../routes/offers");
const notification = require("../routes/notification");

// const error = require("../middleware/error");

module.exports = function (app) {
    app.use(express.json());
    app.use(morgan("tiny"));
    app.use("/api/users", user);
    app.use("/api/library", library);
    app.use("/api/book", book);
    app.use("/api/offers", offer);
    app.use("/api/notifications", notification);
};
