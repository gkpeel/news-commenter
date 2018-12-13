var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
    },
    link: {
        type: String,
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'NewsComment'
        }
    ]
});

var Article = mongoose.model("Article", ArticleSchema);

ArticleSchema.pre("save", function (next, done) {
    var self = this;
    mongoose.models["Article"].findOne({ link: self.link }, function (err, user) {
        if (err) {
            done(err);
        } else if (user) {
            self.invalidate("username", "username must be unique");
            done(new Error("username must be unique"));
        } else {
            done();
        }
    });
    next();
});

module.exports = Article;