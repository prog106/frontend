const express = require('express');
const router = express.Router();

module.exports = function() {
    // HOME
    router.get('/', function(req, res) {
        res.render('index.ejs', {
            user_idx: req.session.user_idx,
            user_name: req.session.user_name,
            user_email: req.session.user_email,
        });
    });
    router.get('/chat', function(req, res) {
        res.render('chat/index.ejs', {
            user_idx: req.session.user_idx,
            user_name: req.session.user_name,
            user_email: req.session.user_email,
        });
    });
    router.get('/io', function(req, res) {
        res.render('chat/io.ejs');
    });
    return router;
}
