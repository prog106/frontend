module.exports = function(app) {
    const express = require('express');
    let route = express.Router();

    route.get('/page', function(req, res) {
        res.send('router2/page!');
    });

    app.get('/router3', function(req, res) {
        res.send('router3');
    });

    return route;
}
