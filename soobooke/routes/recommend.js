module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    const auth = require('../modules/auth.js');
    const cheerio = require('cheerio');

    let router = express.Router();

    // 책추천
    router.get('/', function(req, res) {
        // let message = '해시태그 테스트 #해시 태그 #해시태그 #해시태그 테스트 # 해시태그 테스트 #해시태그#테스트 #해시태그-테스트 #해시태그_테스트';
        // // msg = message.match(/#[^\s]*/gm);
        // msg = message.match(/#[^\s]+/gm);
        // console.log(msg);
        // function util_convert_to_hash_tag(str) {
        //     var inputString = str;
        //     inputString = inputString.replace(/#[^#\s]+|@[^@\s]+/gm, function (tag) {
        //         console.log(tag);
        //         return (tag.indexOf('#')== 0) ? '<a href="/search/tags/?keyword=' + encodeURIComponent(tag.replace('#','')) + '">' + tag + '</a>' : '<a href="/' + tag.replace('@','') + '">' + tag + '</a>';
        //     });
        //     return inputString;
        // }
        // let t1 = util_convert_to_hash_tag(message);
        // console.log(t1);

        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) return res.redirect('/login');
        let user = req.user;
        if(!user || !user.user_idx) return res.redirect('/choose');
        res.render('recommend/index.ejs', { user: user, path: req.originalUrl });
    });
    // 책추천 정보 가져오기
    router.get('/info', function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        db.query(`SELECT * FROM book_introduce`,
            [],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '에러가 발생했습니다.';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    // 책추천 등록 유저 정보 가져오기
    router.get('/info/:usercode', function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        if(!req.params.usercode) {
            ret.message = '사용자 코드를 입력해 주세요.';
            return res.json(ret);
        }
        db.query(`SELECT * FROM book_introduce WHERE user_code = ?`,
            [req.params.usercode.substr(1)],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '에러가 발생했습니다.';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    // 책추천 정보 등록하기
    router.post('/info', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        if(!req.body.message) {
            ret.message = '메시지를 입력해 주세요.';
            return res.json(ret);
        }
        db.query(`SELECT * FROM book_user WHERE user_idx = ?`,
            [user.user_idx],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '에러가 발생했습니다.';
                    return res.json(ret);
                }
                let row = rows[0];
                db.query(`INSERT INTO book_introduce (user_code, user_name, message, created_at) VALUES (?, ?, ?, NOW())`,
                    [row.user_code, row.user_name, req.body.message],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '에러가 발생했습니다.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        ret.message = '등록되었습니다.';
                        return res.json(ret);
                    }
                );
            }
        );
        // if(!req.body.book) {
        //     ret.message = '책 정보를 다시 확인해 주세요.';
        //     return res.json(ret);
        // }
    });
    // 우리 가족 책장 책꽂이 정보 가져오기
    router.get('/shelfclass', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        db.query(`SELECT * FROM shelf WHERE parent_user_idx = ? ORDER BY shelf_order DESC, shelf_idx DESC`,
            [user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '에러가 발생했습니다.';
                    return res.json(ret);
                }
                ret.success = true;
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    return router;
}
