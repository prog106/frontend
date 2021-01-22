const express = require('express');
const router = express.Router();

module.exports = function(app) {
    router.get('/', function(req, res) {
        console.log(req.user);
        //console.log(req.session);
        res.render('index.ejs');
    });
    return router;
}
