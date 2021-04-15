const db = require('../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용

module.exports=function(app) {
    const express = require('express');

    let router = express.Router();

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    // 회원정보
    router.get('/info', function(req, res) {
        let user_idx = req.user.user_idx;
        if(!user_idx) return res.redirect('/logout');
        db.query('SELECT * FROM test_book_user WHERE user_idx = ?', [user_idx], function(err, rows, fields) {
            if(rows.length < 1) return res.render('error.ejs', {'message': 'login error, retry!', 'location': '/logout'});
            let user = rows[0];
            return res.render('user/info.ejs', { user: user });
        });
    });

    return router;
}
