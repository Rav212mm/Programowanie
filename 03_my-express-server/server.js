//jshint esversion:6

const express = require('express');
const app = express();

app.get("/", function(req, res) {
    res.send("<h1> Hello </h1>");
});

app.get("/contact", function(req, res) {
    res.send("Contact me at rafal.sabak@gmail.com");
});

app.get("/about", function(req, res) {
    res.send("I'm mechanical Engineer");
});

app.get("/hobbies", function(req, res) {
    res.send("My hobbie is ...");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});