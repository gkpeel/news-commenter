var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
    },
    link: {
        type: String,
        unique: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'NewsComment'
        }
    ]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;