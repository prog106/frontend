const express = require('express');
const router = express.Router();

module.exports = function() {
    router.get('/info', function(req, res) {
        res.render('user/info.ejs');
    });
    return router;
}
