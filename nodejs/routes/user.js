const express = require('express');
const router = express.Router();

const db = require('../modules/common.js').db();

module.exports = function() {
    // 회원정보
    router.get('/info', function(req, res) {
        let user_idx = req.session.user_idx;
        if(!user_idx) return res.redirect('/forms/logout');
        db.query('SELECT * FROM test_user WHERE user_idx = ?', [user_idx], function(err, rows, fields) {
            if(rows.length < 1) return res.render('error.ejs', {'message': 'login error, retry!', 'location': '/forms/logout'});
            let user = rows[0];
            return res.render('user/infos.ejs', {
                'user_idx': user.user_idx,
                'user_name': user.user_name,
                'user_email': user.user_email,
            });
        });
        // res.render('user/info.ejs'); // XMLHttpRequest
    });
    return router;
}
