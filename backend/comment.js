
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Comments only need message, since logic is dictated by thread parameters
const commentSchema = new Schema(
    {
    message: String,
    children: [String] //Saves reference to children
    }
);

module.exports = mongoose.model("Comment", commentSchema);