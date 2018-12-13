var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    body: String
});

var NewsComment = mongoose.model("NewsComment", CommentSchema);
module.exports = NewsComment;