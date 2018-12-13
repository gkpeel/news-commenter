
var buildCommentItem = function (commentObj) {
    var commentItemHTML = $('<div class="comment-section__single d-flex">').attr('data-id', commentObj._id);
    var commentText = $('<p>').text(commentObj.body);
    var commentDelete = $('<a class="comment-section__delete">').attr('data-id', commentObj._id).text('Delete');
    commentItemHTML.append(commentText).append(commentDelete);

    return commentItemHTML;
}

var buildCommentArchive = function (comments) {
    var retval = $('<div>');

    comments.forEach(function (comment) {
        retval.append(buildCommentItem(comment));
    });

    return retval;
}


var buildComments = function (ArticleInfo) {
    var commentSection = $('<div class="comment-section__container row mt-5">').prepend('<div class="col-12"><h4>Comments</h4>');
    var commentArchive = $('<div class="comment-section__archive col-12">');
    var createComment = $('<div class="comment-section__create-container col-12 mt-4">');

    commentArchive.append(buildCommentArchive(ArticleInfo.comments));
    createComment.append('<form><div class="form-group"><label for="create-comment">Add some text</label><textarea class="form-control" id="create-comment" rows="3"></textarea><button type="submit" id="comment-submit" data-id="' + ArticleInfo.id + '" class="btn btn-lg btn-primary mt-3">Submit</button></div></form>');

    commentSection.append(commentArchive).append(createComment);
    return commentSection;
}

var buildArticle = function (data) {
    var preview = $('<div id="current-preview" class="row">');
    var articleIMG = $('<div class="col-sm-4 mb-4"><img class="img-fluid" id="preview-img" src="' + data.imgURL + '"></div>');
    var headlineContainer = $('<div class="col-sm-8 mb-4">');
    var headline = $('<h2 class="mb-3">').text(data.headline);
    headlineContainer = headlineContainer.append(headline)
    var blurb = $('<h5 class="col-12 mb-5">').text(data.blurb);
    var story = $('<div class="col-12 main-story">').html(data.story);
    var readMore = $('<a>').addClass('mt-5 mx-auto text-center btn btn-primary btn-lg').attr('href', data.url).attr('target', '_blank').text('Read More');

    preview.append(headlineContainer).append(articleIMG).append(blurb).append(story).append(readMore);
    return preview;
}

var loadArticles = function () {
    $.getJSON('/api/articles', function (data) {
        data.forEach(function (article) {
            var title = article.title.trim();
            var entry = $('<div class="item">');
            entry.attr('data-id', article._id);
            entry.text(title);
            $('#all-articles').append(entry);
        });
    });
}

$(document).ready(function () {
    loadArticles();
});

$(document).on('click', '.item', function (e) {
    var objectID = $(this).data('id');
    $.ajax({
        method: 'GET',
        url: '/api/articles/' + objectID,
    }).then(function (data) {
        console.log(data);
        $('#article-preview').empty().css('display', 'block');
        $('.new-scrape__screen').css('display', 'none');
        var preview = buildArticle(data);
        var comments = buildComments(data);
        $('#article-preview').append(preview).append(comments);
    });
});


$(document).on('click', '#comment-submit', function (e) {
    e.preventDefault();
    var articleID = $(this).data('id');
    var commentString = $('#create-comment').val().trim();
    $('#create-comment').empty(); //Doesn't work. Hypo. - cause textarea is dynamically created
    console.log(commentString, articleID);
    $.ajax({
        method: 'POST',
        url: '/api/comments/' + articleID,
        data: {
            body: commentString,
        }
    }).then(function (response) {
        $('.comment-section__archive').append(buildCommentItem(response));
    });
});


$(document).on('click', '.comment-section__delete', function (e) {
    e.preventDefault();
    var commentID = $(this).data('id');
    $(this).parent().remove();
    $.ajax({
        method: "DELETE",
        url: '/api/comments/' + commentID
    }).then(function (data) {
        console.log(data);
    });
});

$(document).on('click', "#make-scrape", function (e) {
    console.log('hi');
    e.preventDefault();
    $.ajax({
        method: "GET",
        url: '/api/get-articles'
    }).then(function () {
        $('#all-articles').empty();
        loadArticles();
    });
});