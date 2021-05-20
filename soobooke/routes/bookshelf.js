module.exports=function(app) {
    const db = require('../modules/common.js').db();
    const express = require('express');
    const request = require('request');
    const multer  = require('multer');
    const upload = multer({ dest: 'uploads/' });
    const moment = require('moment');
    const crypt = require('../modules/crypto.js');
    const auth = require('../modules/auth.js');
    const cheerio = require('cheerio');

    let router = express.Router();

    // 우리 가족 책장
    router.get('/', function(req, res) {
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) return res.redirect('/login');
        if(!user.user_idx) return res.redirect('/choose');
        res.render('bookshelf/index.ejs', { user: user, path: req.originalUrl });
    });
    // 우리 가족 책장에 담기 - 검색 후
    router.post('/', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            code: '',
        };
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '담기 기능은 로그인 후 이용할 수 있습니다.';
            return res.json(ret);
        }
        if(!req.body.book) {
            ret.message = '선택된 책이 없습니다.';
            return res.json(ret);
        }
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
                        if(err.errno == 1062) ret.message = '우리 가족 책장에 담겨있는 책입니다.';
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
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
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
                    LEFT JOIN mybook MB ON MB.book_idx = BS.book_idx AND MB.user_idx = ? AND MB.season IS NULL
                WHERE BS.parent_user_idx = ?
                ORDER BY BS.bookshelf_idx DESC`,
            [user.user_idx, user.parent_user_idx],
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
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
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
        let user = auth.login_check(req.signedCookies['SBOOK.uid']);
        if(!user) {
            ret.message = '로그인 후 이용해 주세요.';
            ret.code = 'logout';
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







    // 책 찾기
    router.post('/aaa', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
            data: [],
        };
        if(!req.body.keyword) return res.json(ret);
        let keyword = encodeURI(req.body.keyword);
        let page = (req.body.page) ? req.body.page : 1;
        db.query('SELECT * FROM test_book WHERE isbn13 = ?', [keyword], function(err, rows, fields) {
            if(rows.length > 0) {
                ret.success = true;
                rows.forEach(function(v, k) {
                    delete rows[k].book_idx;
                });
                ret.data = rows;
                return res.json(ret);
            } else {
                const request = require('request');
                let url = `https://dapi.kakao.com/v3/search/book?query=${keyword}&page=${page}`;
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
                            ret.data.push({
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
                            });
                            db.query(`INSERT INTO test_book (isbn10, isbn13, title, publisher, authors, translators, thumbnail, contents, regdate, daum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        ON DUPLICATE KEY UPDATE regdate = VALUES(regdate)`,
                                [isbn10, isbn13, title, publisher, authors, translators, thumbnail, contents, regdate, daum],
                                function(err, rows, fields) {
                                    if(err) console.log(err);
                                }
                            );
                        });
                        ret.success = true;
                        return res.json(ret);
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
