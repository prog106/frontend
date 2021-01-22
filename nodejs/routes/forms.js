const express = require('express');
const router = express.Router();

module.exports = function () {
    router.get('/join', function(req, res) {
        res.render('forms/join.ejs');
    });
    router.get('/login', function(req, res) {
        console.log(req.user);
        res.render('forms/login.ejs');
    });
    return router;
}
