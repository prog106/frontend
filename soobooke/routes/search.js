const db = require('../modules/common.js').db();
const request = require('request');
const bodyParser = require('body-parser'); // post 전송용
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

module.exports=function(app) {
    const express = require('express');

    let router = express.Router();

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    // 책 찾기 - naver
    router.put('/naver', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.body.keyword) return res.json(ret);
        let keyword = encodeURI(req.body.keyword);
        let display = 10;
        let page = (req.body.page) ? req.body.page * display : 1;
        let url = `https://openapi.naver.com/v1/search/book.json?query=${keyword}&start=${page}&display=${display}&sort=count`;
        // get
        let options = {
            url: url,
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_ID,
                'X-Naver-Client-Secret': process.env.NAVER_SECRET,
            }
        };
        request.get(options, function(err, response, body) {
            let data = JSON.parse(body);
            if(data.items.length > 0) {
                data.items.forEach(function(v, k) {
                    let ex = v.isbn.split(' ');
                    let isbn10 = ex[0];
                    let isbn13 = ex[1];
                    let title = v.title;
                    let publisher = v.publisher;
                    let authors = v.author;
                    let translators = '';
                    let thumbnail = v.image;
                    // let contents = v.description;
                    let regdate = v.pubdate.substr(0, 4)+'-'+v.pubdate.substr(4,2)+'-'+v.pubdate.substr(6,2);
                    let link = v.link;
                    ret.data.push({
                        isbn10: isbn10,
                        isbn13: isbn13,
                        title: title,
                        publisher: publisher,
                        authors: authors, 
                        translators: translators, 
                        thumbnail: thumbnail, 
                        // contents: contents, 
                        regdate: regdate, 
                        link: link,
                    });
                });
                ret.success = true;
                return res.json(ret);
            } else {
                ret.message = '일치하는 데이터가 없습니다.';
                return res.json(ret);
            }
        });
    });
    // 책 찾기 - daum
    router.put('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.body.keyword) return res.json(ret);
        let keyword = encodeURI(req.body.keyword);
        let page = (req.body.page) ? req.body.page : 1;
        let url = `https://dapi.kakao.com/v3/search/book?query=${keyword}&page=${page}`;
        // get
        let options = {
            url: url,
            headers: {
                'Authorization': "KakaoAK "+process.env.KAKAO_ID,
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
                    // let contents = v.contents;
                    let regdate = v.datetime.substr(0, 10);
                    let link = v.url;
                    ret.data.push({
                        isbn10: isbn10,
                        isbn13: isbn13,
                        title: title,
                        publisher: publisher,
                        authors: authors, 
                        translators: translators, 
                        thumbnail: thumbnail, 
                        // contents: contents, 
                        regdate: regdate, 
                        link: link,
                    });
                });
                ret.success = true;
                return res.json(ret);
            } else {
                ret.message = '일치하는 데이터가 없습니다.';
                return res.json(ret);
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
    // 책 제거하기
    router.post('/del', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(req.body.mylove) user_idx = req.body.mylove;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                db.query('DELETE FROM test_book_info WHERE user_idx = ? AND book_idx = ? LIMIT 1',
                    [user_idx, rows[0].book_idx],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '제거 오류!';
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

    // 책 읽기 시작하기
    router.post('/read', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(req.body.mylove) user_idx = req.body.mylove;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        let info_idx = req.body.book;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                db.query(`UPDATE test_book_info SET status = 'reading', read_started_at = NOW() WHERE info_idx = ? AND user_idx = ? AND book_idx = ?`,
                    [info_idx, user_idx, rows[0].book_idx],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '수정 오류!';
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

    // 책 모두 읽었어요
    router.post('/complete', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(req.body.mylove) user_idx = req.body.mylove;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        let info_idx = req.body.book;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                db.query(`UPDATE test_book_info SET status = 'complete', read_ended_at = NOW() WHERE info_idx = ? AND user_idx = ? AND book_idx = ?`,
                    [info_idx, user_idx, rows[0].book_idx],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '수정 오류!';
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

    // 내책 가져오기 - 부모/아이 모두
    router.post('/list', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(req.body.mylove) user_idx = req.body.mylove;
        db.query(`SELECT
                        B.*,
                        BI.*
                    FROM test_book_info BI
                        INNER JOIN test_book B ON B.book_idx = BI.book_idx
                    WHERE user_idx = ?
                    ORDER BY read_started_at ASC, info_idx ASC`,
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

    // 책 보내기
    router.post('/send', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.user_idx) return res.json(ret);
        let user_idx = req.user.user_idx;
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [isbn], function(err, rows, fields) {
            if(rows.length > 0) {
                db.query('INSERT INTO test_book_send (user_idx, to_user_idx, book_idx, sended_at) VALUES (?, ?, ?, NOW())',
                    [user_idx, mylove, rows[0].book_idx],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '보내기 오류!';
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

    // 아이가 받은 책 책장으로 옮기기
    router.post('/go_bookshelf', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.body.isbn) return res.json(ret);
        let isbn = req.body.isbn;
        if(!req.body.mylove) return res.json(ret);
        let mylove = req.body.mylove;
        db.query(`INSERT INTO test_book_info (user_idx, book_idx, from_user_idx)
                    SELECT to_user_idx, book_idx, user_idx FROM test_book_send WHERE send_idx = ? AND to_user_idx = ?`,
            [isbn, mylove],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '책장으로 옮기기 오류!';
                    return res.json(ret);
                }
                db.query(`UPDATE test_book_send SET checked_at = NOW() WHERE send_idx = ? AND to_user_idx = ?`,
                    [isbn, mylove], function(err, rows, fields) {
                        if(err) console.log(err);
                    }
                );
                ret.success = true;
                return res.json(ret);
            }
        );
    });
    return router;
}
