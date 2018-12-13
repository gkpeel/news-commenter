var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");



module.exports = function (app) {

    app.get("/api/get-articles", function (req, res) {
        axios.get("https://www.theguardian.com/environment/all").then(function (response) {

            var $ = cheerio.load(response.data);

            $(".fc-item__container a.u-faux-block-link__overlay").each(function (i, element) {
                var link = $(element).attr('href');
                var title = $(element).text();
                result = { link: link, title: title };
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    }).catch(function (err) {
                        return res.json(err);
                    });
            });
            res.send("Scrape Complete");
        });
    });


    app.get('/api/articles', function (req, res) {
        db.Article.find({}, null, { sort: { _id: -1 } }, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                res.json(data);
            }
        });
    });


    app.get('/api/articles/:id', function (req, res) {
        var previewInfo = {
            id: req.params.id
        };
        db.Article.findById(req.params.id)
            .populate('comments')
            .then(function (dbArticle) {
                previewInfo.url = dbArticle.link;
                previewInfo.comments = dbArticle.comments
                return axios.get(dbArticle.link);
            })
            .then(function (fullStory) {
                console.log(fullStory);
                var $ = cheerio.load(fullStory.data);
                previewInfo.imgURL = $('picture img').attr('src');
                $('figure, aside, .submeta').empty();
                previewInfo.headline = $('.content__headline').text().trim();
                previewInfo.story = $('.content__article-body').html();
                previewInfo.blurb = $('.content__standfirst').text().trim();
                res.json(previewInfo);
            })
            .catch(function (err) {
                res.json(err);
            });
    });


    app.post('/api/comments/:id', function (req, res) {
        commentInfo = {};
        db.NewsComment.create(req.body)
            .then(function (data) {
                commentInfo = data;
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: data._id } }, { new: true });
            })
            .then(function (articleData) {
                res.json(commentInfo);
            })
            .catch(function (err) {
                res.json(err);
            })
    });


    app.delete("/api/comments/:id", function (req, res) {
        console.log(req.params.id);
        db.NewsComment.deleteOne({ _id: req.params.id })
            .then(function (droppedItem) {
                res.json(droppedItem);
            });
    });
};