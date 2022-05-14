// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static("public"));

// connects to our local DB
mongoose.connect("mongodb://localhost:27017/wikiDB", { useNewUrlParser: true });

// article schema
const articleSchema = {
    title: String,
    content: String,
};

// article model
const Article = mongoose.model("Article", articleSchema);

/////////////// Requests targeting all articles ///////////////

// chained route handler
app.route("/articles")
.get(function(req, res){
// fetch articles 
/*
* check that it works:
* http://localhost:3000/articles
* should see results in console / terminal
*/
    Article.find(function(err, foundArticles){
        if(!err){
            res.send(foundArticles);
        } else{
            res.send(err);
        }

    });
})
.post(function(req, res){
    // post new articles
    console.log(req.body.title);
    console.log(req.body.content);

    // create new article
    const newArticle = new Article({
        title: req.body.title,
        content:req.body.content,
    });

    // save new article
    newArticle.save(function(err){
        if(!err){
            res.send("Successfully added.");
        } else {
            res.send(err);
        }
    });
})
.delete(function(req, res){
    // delete article
    Article.deleteMany(function(err){
        if(!err){
            res.send("Successfully deleted all article!");
        } else {
            res.send(err);
        }
    });
});

/////////////// Requests targeting specific articles ///////////////

app.route("/articles/:articleTitle")
.get(function(req, res){

    Article.findOne({title: req.params.articleTitle,}, function(err, foundArticle){
        if(foundArticle){
            res.send(foundArticle);
        } else {
            res.send("No article matching that title found!");
        }
    });
})
.put(function(req, res){
    Article.updateOne(
        {title: req.params.articleTitle}, 
        {
            title: req.body.title, 
            content: req.body.content,
        },
        { upsert: true },
        function(err){
            if(!err){
                res.send("Successfully updated article!");
            } else {
                res.send(err);
            } 
        }
        );
})
.patch(function(req, res){
    Article.updateOne(
        {title: req.params.articleTitle},
        // body in postman needs to be: x-www-form-urlencoded
       {$set: req.body},
        function(err){
            if(!err){
                res.send("Successfully updated article.");
            } else {
                res.send(err);
            }
        }
    );
})
.delete(function(req, res){
    Article.deleteOne(
        {title: req.params.articleTitle},
        {$set: req.body },
        function(err){
            if(!err){
                res.send("Article deleted successfully.");
            } else {
                res.send(err);
            }
        } 
        );
});

app.listen(3000, function(){
    console.log("server started at port 3000");
});