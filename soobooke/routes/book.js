const db = require('../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports=function(app) {
    const express = require('express');

    let router = express.Router();

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    // 책 찾기
    router.post('/search', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                ret.success = true;
                delete rows[0].book_idx;
                ret.data = rows[0];
                return res.json(ret);
            } else {
                const request = require('request');
                let url = 'https://dapi.kakao.com/v3/search/book?query='+isbn;
                // get
                let options = {
                    url: url,
                    headers: {
                        'Authorization': "KakaoAK 29085ec013c9d06aa8e7cc46d73b657e"
                    }
                }
                request.get(options, function(err, response, body) {
                    let data = JSON.parse(body);
                    if(data.documents.length > 0) {
                        data.documents.forEach(function(v, k) {
                            let ex = v.isbn.split(' ');
                            let isbn10 = ex[0];
                            let isbn13 = ex[1];
                            let title = v.title;
                            let publisher = v.publisher;
                            let authors = v.authors.join(',');
                            let translators = v.translators.join(',');
                            let thumbnail = v.thumbnail;
                            let contents = v.contents;
                            let regdate = v.datetime.substr(0, 10);
                            let daum = v.url;
                            db.query('INSERT INTO test_book (isbn10, isbn13, title, publisher, authors, translators, thumbnail, contents, regdate, daum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                                [isbn10, isbn13, title, publisher, authors, translators, thumbnail, contents, regdate, daum],
                                function(err, rows, fields) {
                                    if(err) {
                                        ret.message = '책 정보 저장 오류';
                                        return res.json(ret);
                                    }
                                    ret.success = true;
                                    ret.data = {
                                        // book_idx: rows.insertId,
                                        isbn10: isbn10,
                                        isbn13: isbn13,
                                        title: title,
                                        publisher: publisher,
                                        authors: authors, 
                                        translators: translators, 
                                        thumbnail: thumbnail, 
                                        contents: contents, 
                                        regdate: regdate, 
                                        daum: daum,
                                    }
                                    return res.json(ret);
                                }
                            );
                        });
                    } else {
                        ret.message = '일치하는 데이터가 없습니다.';
                        return res.json(ret);
                    }
                });
            }
        });
    });

    // 책 추가하기
    router.post('/add', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                db.query('INSERT INTO test_book_info (user_idx, book_idx) VALUES (?, ?)',
                    [user_idx, rows[0].book_idx],
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
            } else {
                ret.message = '일치하는 데이터가 없습니다.';
                return res.json(ret);
            }
        });
    });

    // 책 가져오기
    router.post('/list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        db.query(`SELECT
                        B.*,
                        BI.*
                    FROM test_book_info BI
                        INNER JOIN test_book B ON B.book_idx = BI.book_idx
                    WHERE user_idx = ?`,
            [user_idx], function(err, rows, fields) {
                if(rows.length > 0) {
                    ret.success = true;
                } else {
                    ret.message = '데이터가 없습니다.';
                }
                ret.data = rows;
                return res.json(ret);
            }
        );
    });
    return router;
}
