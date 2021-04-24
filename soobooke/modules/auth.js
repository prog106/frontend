module.exports.social = function(db, req, id, username, email, thumbnail, platform, done) {
    db.query('SELECT * FROM book_user WHERE user_platform_id = ? AND user_platform = ?', [id, platform], function(err, rows, fields) {
        if(err) return done(err);
        if(rows.length < 1) {
            db.query(
                'INSERT INTO book_user (user_name, user_email, user_profile, user_platform, user_platform_id, user_created_at, user_updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [username, email, thumbnail, platform, id],
                function(err, rows, fields) {
                    if(err) return done(err);
                    let user = {
                        // user_idx: rows.insertId,
                        parent_user_idx: rows.insertId,
                        user_name: username,
                        user_email: email,
                        user_profile: thumbnail,
                        user_platform: platform,
                    }
                    db.query('UPDATE book_user SET parent_user_idx = user_idx WHERE user_idx = ?',
                        [rows.insertId],
                        function(err, rows, fields) {
                        }
                    );
                    return done(null, user);
                }
            );
        } else {
            let info = rows[0];
            let user = {
                // user_idx: info.user_idx,
                parent_user_idx: info.parent_user_idx,
                user_name: info.user_name,
                user_email: info.user_email,
                user_profile: info.user_profile,
                user_platform: info.user_platform,
            }
            return done(null, user);
        }
    });
}
// CREATE TABLE `book_user_login` (
//     `login_code` varchar(10) NOT NULL COMMENT '회원 로그인 임시코드',
//     `user_idx` int(10) unsigned NOT NULL COMMENT 'PK',
//     `login_limited_at` datetime DEFAULT NULL COMMENT '사용가능 제한 일시',
//     PRIMARY KEY (`login_code`),
//     UNIQUE KEY `idx_user_idx` (`user_idx`),
//     KEY `idx_login_limited_at` (`login_limited_at`)
//   ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='회원 로그인 임시코드';
module.exports.local = function(db, id, platform, done) {
    db.query(`SELECT U.* FROM
                book_user_login UL
            INNER JOIN book_user U ON UL.user_idx = U.user_idx
            WHERE 1=1 AND UL.login_code = ? AND login_limited_at >= NOW()`,
        [id],
        function(err, rows, fields) {
            if(err) return done(err);
            if(!rows) return done(null, false, { message: 'login error (no match data).' });
            let row = rows[0];
            let user = {
                parent_user_idx: row.parent_user_idx,
                user_name: row.user_name,
                user_email: row.user_email,
                user_profile: row.user_profile,
                user_patform: platform,
            }
            return done(null, user);
        }
    );
}
