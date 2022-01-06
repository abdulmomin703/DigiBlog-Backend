const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    library: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
});

const Book = mongoose.model("Book", bookSchema);

module.exports.Book = Book;
module.exports.bookSchema = bookSchema;
