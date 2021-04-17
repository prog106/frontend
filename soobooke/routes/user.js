const db = require('../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

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

    // 내 아이 등록하기
    router.post('/add_mylove', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query('INSERT INTO test_book_user (relation, relation_user_idx, nickname) VALUES (?, ?, ?)',
            ['children', user_idx, mylove],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '등록 오류!';
                    return res.json(ret);
                }
                ret.success = true;
                return res.json(ret);
            }
        );
    });

    // 내 아이 정보
    router.post('/mylove_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        db.query('SELECT * FROM test_book_user WHERE relation_user_idx = ? AND relation = ?',
            [user_idx, 'children'],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });

    // 내가 보내준 책 정보
    router.post('/bookshelf_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        db.query(`SELECT * FROM test_book_send
                        INNER JOIN test_book
                    WHERE user_idx = ?`,
            [user_idx, 'children'],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });

    // 내 아이가 받은 책 정보
    router.post('/send_list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query(`SELECT BI.*, B.* FROM test_book_send BI
                        INNER JOIN test_book B ON B.book_idx = BI.book_idx
                    WHERE BI.to_user_idx = ? AND checked_at IS NULL`,
            [mylove],
            function(err, rows, fields) {
                if(err) console.log(err);
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });

    return router;
}
