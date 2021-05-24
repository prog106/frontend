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

    // 책소개
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
        res.render('introduce/index.ejs', { user: user, path: req.originalUrl });
    });
    // 책소개 등록하기
    router.post('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let puser = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!puser) {
            ret.message = '책 소개하기는 로그인 후 이용할 수 있습니다.';
            return res.json(ret);
        }
        let user = req.user;
        if(!user || !user.user_idx) {
            ret.code = 'choose';
            return res.json(ret);
        }
        if(!req.body.message) {
            ret.message = '책 소개 메시지를 입력해 주세요.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '선택된 책이 없습니다.';
            return res.json(ret);
        }


        return res.json(ret);
        let book = JSON.parse(req.body.book);
        db.query('SELECT * FROM book WHERE isbn13 = ?', [book.isbn13], function(err, rows, fields) {
            if(err) {
                ret.message = '에러가 발생했습니다.';
                return res.json(ret);
            }
            if(rows.length > 0) {
                let book_idx = rows[0].book_idx;
                let book_point = rows[0].page;
                db.query(`INSERT INTO bookshelf (parent_user_idx, book_idx, book_point, created_at) VALUES (?, ?, ?, NOW())`, [user.parent_user_idx, book_idx, book_point], function(err, rows, fields) {
                    if(err) {
                        ret.message = '책장에 담지 못했습니다.\n\n잠시후 다시 시도해 주세요.';
                        if(err.errno == 1062) {
                            ret.code = 'already';
                            ret.message = '우리 가족 책장에 담겨있는 책입니다.';
                        }
                        return res.json(ret);
                    }
                    ret.success = true;
                    return res.json(ret);
                });
            } else {
                let page = 50; // 페이지 조회 실패시 기본값.
                let thumbnail = book.thumbnail.replace('type=m1&', 'type=m140&'); // 큰 이미지로 교체
                request(book.link, function(err, response, body) {
                    const $ = cheerio.load(body);
                    page = $(".book_info_inner").html().split('<em>페이지</em> ')[1].split('<span class="bar">|</span>')[0];
                    // https://bookthumb-phinf.pstatic.net/cover/018/762/01876290.jpg?type=m1&udate=20130131
                    db.query(`INSERT INTO book 
                                (isbn10, isbn13, title, publisher, authors, translators, page, price, thumbnail, regdate, link)
                            VALUES
                                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE page = VALUES(page)`,
                        [book.isbn10, book.isbn13, book.title, book.publisher, book.authors, book.translators, page, book.price, thumbnail, book.regdate, book.link],
                        function(err, rows, fields) {
                            if(err) {
                                console.log(err);
                                ret.message = '에러가 발생했습니다..';
                                return res.json(ret);
                            }
                            let book_idx = rows.insertId;
                            let book_point = page;
                            db.query(`INSERT INTO bookshelf (parent_user_idx, book_idx, book_point, created_at) VALUES (?, ?, ?, NOW())`, [user.parent_user_idx, book_idx, book_point], function(err, rows, fields) {
                                if(err) {
                                    ret.message = '책장에 담지 못했습니다.\n\n잠시후 다시 시도해 주세요.';
                                    if(err.errno == 1062) ret.message = '우리 가족 책장에 담겨있는 책입니다.';
                                    return res.json(ret);
                                }
                                ret.success = true;
                                return res.json(ret);
                            });
                        }
                    );
                });
            }
        });
    });
    // 우리 가족 책장 가져오기
    router.get('/info', upload.none(), function(req, res) {
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
        db.query(`SELECT
                    BS.book_point,
                    B.*,
                    IF(S.shelf_name, S.shelf_name, '기타') AS shelf_name,
                    IF(MB.mybook_idx, 1, 0) AS mybook
                FROM bookshelf BS
                    INNER JOIN book B ON B.book_idx = BS.book_idx
                    LEFT JOIN shelf S ON S.shelf_idx = BS.shelf_idx
                    LEFT JOIN mybook MB ON MB.book_idx = BS.book_idx AND MB.user_idx = ? AND (MB.season IS NULL OR MB.season = ?)
                WHERE BS.parent_user_idx = ?
                ORDER BY BS.bookshelf_idx DESC`,
            [user.user_idx, moment().format('YYYYMM'), user.parent_user_idx],
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
    // 내 책장으로 옮기기
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
        if(!req.body.book) {
            ret.message = '책 정보를 다시 확인해 주세요.';
            return res.json(ret);
        }
        let book = JSON.parse(req.body.book)[0];
        db.query(`SELECT * FROM mybook WHERE user_idx = ? AND book_idx = ? AND (season IS NULL OR season = '${moment().format('YYYYMM')}')`,
            [user.user_idx, book.book_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '에러가 발생했습니다.';
                    return res.json(ret);
                }
                if(rows.length > 0) {
                    ret.message = '내 책꽂이에 있는 책은 옮길수 없습니다.';
                    return res.json(ret);
                }
                db.query(`INSERT INTO mybook (user_idx, book_idx, mybook_point, created_at) VALUES (?, ?, ?, NOW())`,
                    [user.user_idx, book.book_idx, book.book_point],
                    function(err, rows, fields) {
                        if(err) {
                            ret.message = '에러가 발생했습니다.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        ret.message = '내 책꽂이로 이동되었습니다.';
                        return res.json(ret);
                    }
                );
            }
        );
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
