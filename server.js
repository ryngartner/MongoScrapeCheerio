var express = require("express");
var mongojs = require("mongojs");
var request = require("request");
var cheerio = require("cheerio");


var app = express();

var databaseURL = "scraper";
var collections = ["scrapedData"];

var db = mongojs(databaseURL, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.get("/all", function (req, res) {
    db.scrapedData.find({}, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            res.json(found);
        }
    });
});

app.get("/scrape", function (req, res) {
    request("https://news.ycombinator.com", function (error, response, html) {
        var $ = cheerio.load(html);

        $(".title").each(function (i, element) {
            var title = $(this).children("a").text();
            var link = $(this).children("a").attr("href");

            if (title && link) {
                db.scrapedData.save({
                        title: title,
                        link: link
                    },
                    function (error, saved) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(saved);
                        }
                    });

            }
        });
    });
    res.send("Scrape Complete!");
});

app.listen(3000, function () {
    console.log("App Running On PORT 3000 yo!");
});