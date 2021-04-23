const db = require('../modules/common.js').db();
const bodyParser = require('body-parser'); // post 전송용
const multer  = require('multer');
const upload = multer({
	storage: multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, `${__dirname}/../public/profile`); // public 폴더를 지정합니다.
		},
		filename: (req, file, cb) => {
            function makeRandomName() { // unique
                let name = '';
                let possible = "abcdefghijklmnopqrstuvwxyz1234567890";
                for( let i = 0; i < 10; i++ ) {
                    name += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return name;
            }
			var fileName = makeRandomName(); // 파일 이름
			var mimeType;
			switch (file.mimetype) { // 파일 타입 체크
				case 'image/jpeg':
					mimeType = 'jpg';
					break;
				case 'image/png':
					mimeType = 'png';
					break;
				case 'image/gif':
					mimeType = 'gif';
					break;
				case 'image/bmp':
					mimeType = 'bmp';
					break;
                case 'audio/x-m4a':
                    mimeType = 'm4a';
                    break;
				default:
					mimeType = 'jpg';
					break;
			}
			cb(null, fileName + '.' + mimeType); // 파일 이름 + 파일 타입 형태로 이름을 바꿉니다.
		},
	}),
    limits: { fileSize: 1024*1024*5 }
});

module.exports=function(app) {
    const express = require('express');

    let router = express.Router();

    app.use(bodyParser.urlencoded({extended: false})); // post 전송용

    // 회원정보
    router.get('/info', function(req, res) {
        if(!req.user.user_idx) return res.redirect('/logout');
        // console.log(req.user);
        res.render('user/info.ejs', { user: req.user });
    });
    // 계정들
    router.post('/get_member', function(req, res) {
        let ret = {
            success: false,
            message: null,
            members: [],
        };
        if(!req.user.parent_user_idx) {
            ret.message = '로그인 후 다시 이용해 주세요.'
            return res.json(ret);
        }
        let parent_user_idx = req.user.parent_user_idx;
        db.query('SELECT * FROM book_user WHERE parent_user_idx = ?', [parent_user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
            ret.success = true;
            ret.members = rows;
            return res.json(ret);
        });
    });
    // 프로필 선택
    router.post('/profile', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.parent_user_idx || !req.body.user_idx) {
            ret.message = '로그인 후 다시 이용해 주세요.'
            return res.json(ret);
        }
        db.query('SELECT * FROM book_user WHERE user_idx = ? AND parent_user_idx = ?',
            [req.body.user_idx, req.user.parent_user_idx], function(err, rows, fields) {
            if(err) return res.json(ret);
                let row = rows[0];
                req.user.user_idx = row.user_idx;
                req.user.user_name = row.user_name;
                req.user.user_profile = row.user_profile;
                req.user.user_email = row.user_email;
                ret.success = true;
                return res.json(ret);
            }
        );
    });
    // 닉네임 수정
    router.post('/modify', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        let user_name = req.body.user_nick;
        let user_idx = req.body.user_idx;
        db.query(`UPDATE book_user SET
                    user_name = ?,
                    user_updated_at = NOW()
                    WHERE user_idx = ? AND parent_user_idx = ?`,
            [user_name, user_idx, req.user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '닉네임 변경에 실패하였습니다.';
                    return res.json(ret);
                }
                ret.success = true;
                res.json(ret);
            }
        );
    });
    // 프로필 썸네일 수정
    router.post('/modify_profile_thumb', upload.single('user_profile'), function(req, res) {
        let ret = {
            success: false,
            message: null,
            profile: '',
        };
        let profile = (req.file.filename) ? `/profile/${req.file.filename}` : '';
        let user_name = req.body.user_nick;
        let user_idx = req.body.user_idx;
        db.query(`UPDATE book_user SET
                    user_profile = ?,
                    user_updated_at = NOW()
                    WHERE user_idx = ? AND parent_user_idx = ?`,
            [profile, user_idx, req.user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    console.log(err);
                    ret.message = '프로필 변경에 실패하였습니다.';
                    return res.json(ret);
                }
                ret.profile = profile;
                ret.success = true;
                res.json(ret);
            }
        );
    });
    // 프로필 추가
    router.post('/add_profile', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(!req.user.parent_user_idx) {
            ret.message = '로그인 후 다시 이용해 주세요.'
            return res.json(ret);
        }
        db.query(`SELECT COUNT(*) AS count FROM book_user WHERE parent_user_idx = ?`,
            [req.user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.';
                    return res.json(ret);
                }
                if(rows[0].count >= 4) {
                    ret.message = '사용자를 더이상 추가할 수 없습니다.';
                    return res.json(ret);
                }
                let profile = '/profile/unjct9uk30.png';
                db.query(`INSERT INTO book_user
                            (parent_user_idx, user_name, user_profile, user_created_at, user_updated_at)
                        VALUES
                            (?, ?, ?, NOW(), NOW())`,
                    [req.user.parent_user_idx, req.body.member_name, profile],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '추가에 실패하였습니다.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        res.json(ret);
                    }
                );
            }
        );
    });
    // 프로필 삭제
    router.post('/delete_profile', upload.none(), function(req, res) {
        let ret = {
            success: false,
            message: null,
        };
        if(req.body.user_idx == req.user.user_idx) {
            ret.message = '현재 로그인 된 계정은 삭제할 수 없습니다.';
            return res.json(ret);
        }
        console.log(req.body.user_idx);
        console.log(req.user);
        return res.json(ret);
        if(!req.user.user_idx) return res.json(ret);
        db.query(`SELECT COUNT(*) AS count FROM book_user WHERE parent_user_idx = ?`,
            [req.user.parent_user_idx],
            function(err, rows, fields) {
                if(err) {
                    ret.message = '오류가 발생했습니다.';
                    return res.json(ret);
                }
                if(rows[0].count >= 4) {
                    ret.message = '사용자를 더이상 추가할 수 없습니다.';
                    return res.json(ret);
                }
                let profile = '/profile/unjct9uk30.png';
                db.query(`INSERT INTO book_user
                            (parent_user_idx, user_name, user_profile, user_created_at, user_updated_at)
                        VALUES
                            (?, ?, ?, NOW(), NOW())`,
                    [req.user.parent_user_idx, req.user.user_name, profile],
                    function(err, rows, fields) {
                        if(err) {
                            console.log(err);
                            ret.message = '추가에 실패하였습니다.';
                            return res.json(ret);
                        }
                        ret.success = true;
                        res.json(ret);
                    }
                );
            }
        );
    });
    // 프로필 이미지
    router.post('/profile_img', upload.single('profile_img'), function(req, res) {
        console.log(req.file.filename);
    });
    // 오디오 파일 숨기기
    router.get('/audio', upload.none(), function(req, res) {
        let fs = require('fs');
        fs.readFile('./public/profile/aaa.m4a', function (err, data) {
            res.send(data);
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

    // 아이가 받은 책 정보
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

    // 사용자 선택
    router.post('/select_user', upload.none(), function(req, res) {
        let select_user = req.body.select_user;
        res.cookie('select_user', select_user, { signed: true, expires: new Date(Date.now() + 1000 * 60 * 1), httpOnly: true }); // 30분 쿠키
        let ret = {
            success: true,
            message: null,
        };
        res.json(ret);
    });

    return router;
}
