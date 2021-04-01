const db = require('../modules/common.js').db();
const moment = require('moment');
moment.locale('ko');

module.exports = function(io) {
    let chat = io.of('/chat').on('connection', function(socket) {
        let user = socket.request.session.passport.user; // 사용자 세션정보
        function makeRandomName() { // unique
            let name = moment().format('YYMMDD');
            let possible = "abcdefghijklmnopqrstuvwxyz1234567890";
            for( let i = 0; i < 4; i++ ) {
                name += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return name;
        }
        function reset() {
            // 접속자 정보 업데이트
            db.query(`SELECT CU.socket_id, CU.channel_code AS channel, U.user_name, U.user_profile FROM test_channel_user CU
                INNER JOIN test_user_social U ON U.user_idx = CU.user_idx`,
                [], function(err, rows, fields) {
                    chat.emit('user_list', rows);
                }
            );
            // 채널 정보 업데이트
            db.query(`SELECT C.channel_code, C.channel_title, C.channel_created_at, COUNT(CU.user_idx) AS channel_user_count FROM test_channel C
                LEFT JOIN test_channel_user CU ON CU.channel_code = C.channel_code GROUP BY 1`,
                [], function(err, rows, fields) {
                    // console.log(rows);
                    rows.forEach(function(v, k) {
                        if(v.channel_user_count < 1) {
                            rows.splice(k, 1);
                            db.query(`DELETE FROM test_channel WHERE channel_code = ?`, [v.channel_code], function(err, rows, fields) { });
                        }
                    });
                    chat.emit('channel_list', rows);
                }
            );
        }
        // 참여자 접속
        socket.on('ready', function(data) {
            if(!user.user_idx) {
                socket.emit('redirect', '로그인 후 이용해 주세요.');
                return false;
            }
            // 채널 접속
            db.query(`INSERT INTO test_channel_user (user_idx, socket_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE socket_id = VALUES(socket_id)`,
                [user.user_idx, socket.id],
                function(err, rows, fields) {
                    reset();
                }
            );
        });
        // 참여자 채널 만들기 & 접속
        socket.on('channel', function(data) {
            let title = data.title;
            let channel_code = makeRandomName();
            db.query(`INSERT INTO test_channel (channel_code, channel_title, channel_created_at) VALUES (?, ?, NOW())`,
                [channel_code, title], function(err, rows, fields) {
                    db.query(`UPDATE test_channel_user SET channel_code = ? WHERE user_idx = ?`,
                        [channel_code, user.user_idx], function(err, rows, fields) {
                            socket.join(channel_code);
                            chat.to(channel_code).emit('join', {
                                channel: channel_code,
                                title: title,
                            });
                            chat.to(channel_code).emit('notice', {
                                msg: user.user_name + ' 님이 입장하였습니다!',
                            });
                            db.query(`SELECT U.user_name FROM test_channel_user CU
                                INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                                WHERE CU.channel_code = ?`,
                                [channel_code], function(err, rows, fields) {
                                    chat.to(channel_code).emit('join_list', rows);
                                }
                            );
                            reset();
                        }
                    );
                }
            );
        });
        // 참여자 채널 접속
        socket.on('channel_join', function(data) {
            let channel_code = data.channel;
            db.query(`SELECT * FROM test_channel WHERE channel_code = ?`, [channel_code], function(err, rows, fields) {
                if(rows.length < 1) {
                    socket.emit('redirect', '채널에 참여할 수 없습니다.');
                    reset();
                    return false;
                }
                let channel_title = rows[0].channel_title;
                db.query(`UPDATE test_channel_user SET channel_code = ? WHERE user_idx = ?`, [channel_code, user.user_idx], function(err, rows, fields) {
                    socket.join(channel_code);
                    socket.emit('join', { // 나에게
                        channel: channel_code,
                        title: channel_title,
                    });
                    chat.to(channel_code).emit('notice', {
                        msg: user.user_name + ' 님이 입장하였습니다.',
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_code = ?`,
                        [channel_code], function(err, rows, fields) {
                            chat.to(channel_code).emit('join_list', rows);
                        }
                    );
                    reset();
                });
            });
        });
        socket.on('leave', function(data) {
            db.query(`SELECT * FROM test_channel_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                if(rows.length > 0) {
                    let channel_code = rows[0].channel_code;
                    db.query(`UPDATE test_channel_user SET channel_code = '' WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                        chat.to(channel_code).emit('notice', {
                            msg: user.user_name + ' 님이 나갔습니다.',
                        });
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_code = ?`,
                        [channel_code], function(err, rows, fields) {
                            if(rows.length < 1) { // 아무도 없으면 방 삭제
                                db.query(`DELETE FROM test_channel WHERE channel_code = ?`, [channel_code], function(err, rows, fields) { })
                            } else {
                                chat.to(channel_code).emit('join_list', rows);
                            }
                        }
                    );
                    socket.leave(channel_code);
                    socket.room = 0;
                }
                reset();
            });
        });
        socket.on('disconnect', function(data) {
            db.query(`SELECT * FROM test_channel_user WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                if(rows.length > 0) {
                    let channel_code = rows[0].channel_code;
                    socket.leave(channel_code);
                    db.query(`UPDATE test_channel_user SET channel_code = '' WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                        chat.to(channel_code).emit('notice', {
                            msg: user.user_name + ' 님이 나갔습니다.',
                        });
                    });
                    db.query(`SELECT U.user_name FROM test_channel_user CU
                        INNER JOIN test_user_social U ON U.user_idx = CU.user_idx
                        WHERE CU.channel_code = ?`,
                        [channel_code], function(err, rows, fields) {
                            if(rows.length < 1) { // 아무도 없으면 방 삭제
                                db.query(`DELETE FROM test_channel WHERE channel_code = ?`, [channel_code], function(err, rows, fields) { })
                            } else {
                                chat.to(channel_code).emit('join_list', rows);
                            }
                        }
                    );
                }
                socket.emit('reload');
                reset();
            });
        });
        socket.on('chat', function(data) {
            let channel_code = data.channel;
            let msg = data.msg;
            db.query(`INSERT INTO test_channel_chat (channel_code, user_idx, chat, chat_created_at) VALUES (?, ?, ?, NOW())`,
                [channel_code, user.user_idx, msg],
                function(err, rows, fields) {
                    if(rows.insertId > 0) {
                        let res = {
                            idx: user.user_idx,
                            author: user.user_name,
                            msg: data.msg,
                            time: moment().format('LT'), // 오후 2:48
                        }
                        chat.to(channel_code).emit('chat', res);
                    } else {
                        // 메시지 전송 실패 - 나에게만
                        chat.to(channel_code).emit('notice', {
                            idx: user.user_idx,
                            msg: '메시지 발송 실패',
                        });
                    }
                }
            );
        });
    });

    return chat;
}
