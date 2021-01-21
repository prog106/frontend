const express = require('express');
const router = express.Router();

router.get('/page', function(req, res) {
    res.send('router1/page!');
});

module.exports = router;
