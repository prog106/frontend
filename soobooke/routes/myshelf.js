module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');

    let router = express.Router();

    // 내 책꽂이
    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        let render = 'myshelf/index.ejs';
        let today = moment();
        if(user.user_idx != user.parent_user_idx) render = 'myshelf/kid_index.ejs';
        res.render(render, { user: user, today: today, path: req.originalUrl });
    });
    // 내 책꽂이 가져오기
    router.get('/info', function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
            data: [],
            info: {},
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        db.query(`SELECT
                    MB.*,
                    B.*
                FROM mybook MB
                    INNER JOIN book B ON B.book_idx = MB.book_idx
                WHERE 1=1
                    AND MB.user_idx = ?
                    AND (MB.season = ? OR MB.season IS NULL)
                ORDER BY MB.season ASC, MB.completed_at DESC, MB.mybook_idx DESC`,
            [user.user_idx, moment().format('YYYYMM')],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                    return res.json(ret);
                }
                let all = rows.length;
                let ready = 0;
                let start = 0;
                let complete = 0;
                rows.forEach(function(v, k) {
                    delete rows[k].user_idx;
                    delete rows[k].book_idx;
                    delete rows[k].shelf_idx;
                    switch(v.mybook_status) {
                        case "ready": ready++; break;
                        case "start": start++; break;
                        case "request": case "complete": complete++; break;
                    }
                });
                ret.success = true;
                ret.data = rows;
                ret.info = {
                    all: all,
                    ready: ready,
                    start: start,
                    complete: complete,
                }
                return res.json(ret);
            }
        )
    });
    // 책 상태 바꾸기 - ready > [ start > request ] > complete
    router.put('/info', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
            return res.json(ret);
        }
        if(!req.body.code || (req.body.code != 'start' && req.body.code != 'complete')) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '잘못된 요청입니다.';
            return res.json(ret);
        }
        let code = '';
        let book = JSON.parse(req.body.book)[0];
        db.query(`SELECT * FROM mybook WHERE mybook_idx = ? AND user_idx = ?`, [book.mybook_idx, user.user_idx], function(err, rows, fields) {
            if(rows.length < 1) {
                ret.message = '잘못된 요청입니다.';
                return res.json(ret);
            }
            let row = rows[0];
            if(row.mybook_status == 'complete') {
                ret.message = '모두 읽은 책입니다.';
                return res.json(ret);
            }
            mybook_point = row.mybook_point;
            if(user.user_idx == user.parent_user_idx) {
                // transaction 처리 & 중복 읽기 보완 필요
                code = req.body.code;
                db.beginTransaction(function(err) {
                    let sql = `UPDATE mybook SET
                                    ${(code == 'start')? 'started_at = NOW(), ' : ''}
                                    ${(code == 'complete')? `completed_at = NOW(), season = '${moment().format('YYYYMM')}', ` : ''}
                                    mybook_status = ?,
                                    updated_at = NOW()
                                WHERE mybook_idx = ? AND user_idx = ?`;
                    db.query(sql, [code, book.mybook_idx, user.user_idx], function(err, rows, fields) {
                        if(err) {
                            db.rollback(function(err) {
                                ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                return res.json(ret);
                            });
                        }
                        if(req.body.code == 'complete') {
                            db.query(`UPDATE book_user SET user_point = user_point + ${mybook_point} WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                                if(err) {
                                    db.rollback(function(err) {
                                        ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                        return res.json(ret);
                                    });
                                }
                                db.commit(function(err) {
                                    if(err) {
                                        db.rollback(function(err) {
                                            ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                            return res.json(ret);
                                        });
                                        return false;
                                    }
                                    ret.success = true;
                                    ret.code = 'reload';
                                    return res.json(ret);
                                });
                            });
                        } else {
                            db.commit(function(err) {
                                if(err) {
                                    db.rollback(function(err) {
                                        ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                                        return res.json(ret);
                                    });
                                }
                                ret.success = true;
                                return res.json(ret);
                            });
                        }
                    });
                });
            } else {
                code = (req.body.code == 'complete') ? 'request' : req.body.code;
                db.query(`UPDATE mybook SET mybook_status = ?, updated_at = NOW() WHERE mybook_idx = ? AND user_idx = ?`,
                    [code, book.mybook_idx, user.user_idx],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '오류가 발생했습니다.\n\n잠시후 다시 이용해 주세요.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        return res.json(ret);
                    }
                );
            }
        });
    });
    return router;
};
