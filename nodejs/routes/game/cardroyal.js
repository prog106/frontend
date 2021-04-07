const db = require('../../modules/common.js').db();
const moment = require('moment');
moment.locale('ko');
const cardroyal = require('../../modules/game/cardroyal.js'); // module 호출
// const royal = cardroyal();

module.exports = function(io) {
    let chat = io.of('/cardroyal').on('connection', function(socket) {
        if(!socket.request.session.passport) {
            socket.emit('client-disconnect');
            return ;
        }
        socket.emit('connection');
        let user = socket.request.session.passport.user; // 사용자 세션정보
        let sec = 2000;
        function makeRandomName() { // unique
            let name = moment().format('YYMMDD');
            let possible = "abcdefghijklmnopqrstuvwxyz1234567890";
            for( let i = 0; i < 4; i++ ) {
                name += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return name;
        }
        // socket.on('join', function(data) { // event : join - 채팅방 참여
            // socket.nickname = data.nickname;
            // chat.emit('join', data.nickname); // 채팅방 전체 참여자에게 메시지 전송
            // socket.emit('join', data.nickname); // 자기 자신에게만 메시지 전송
            // socket.broadcast.emit('join', data.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
            // chat.to(id).emit('join', data.nickname); // 특정 참여자에게 메시지 전송
        // });
        socket.on('ready', function() {
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    if(rows && rows.length > 0) {
                        // 튕김 참여
                        play_code = rows[0].play_code;
                        socket.join(play_code);
                        db.query(`SELECT
                                    A.king_data AS my_king_data,
                                    A.card_data AS my_card_data,
                                    A.deck_data AS my_deck_data,
                                    A.used_data AS my_used_data,
                                    B.king_data AS rival_king_data,
                                    B.card_data AS rival_card_data,
                                    B.deck_data AS rival_deck_data,
                                    B.used_data AS rival_used_data
                                FROM test_game_cardroyal A
                                    INNER JOIN test_game_cardroyal B ON B.play_code = A.play_code AND B.user_idx != A.user_idx AND B.end = 0
                                WHERE 1=1
                                    AND A.user_idx = ?
                                    AND A.end = 0`,
                            [user.user_idx],
                            function(err, rows, fields) {
                                if(rows && rows.length > 0) {
                                    res = rows[0];
                                    play_code = res.play_code;
                                    my_king_data = JSON.parse(res.my_king_data);
                                    my_card_data = JSON.parse(res.my_card_data);
                                    my_deck_data = JSON.parse(res.my_deck_data);
                                    my_used_data = JSON.parse(res.my_used_data);
                                    rival_king_data = JSON.parse(res.rival_king_data);
                                    rival_card_data = JSON.parse(res.rival_card_data);
                                    rival_deck_data = JSON.parse(res.rival_deck_data);
                                    rival_used_data = JSON.parse(res.rival_used_data);
                                    socket.emit('reset', {
                                        play_code: play_code,
                                        my_king_data: my_king_data,
                                        my_card_data: my_card_data,
                                        my_deck_data: my_deck_data,
                                        my_used_data: my_used_data,
                                        rival_king_data: rival_king_data,
                                        rival_card_data: rival_card_data,
                                        rival_deck_data: rival_deck_data,
                                        rival_used_data: rival_used_data,
                                    });
                                } else {
                                    socket.emit('ready');
                                }
                            }
                        );
                    } else {
                        // 신규 참여
                        db.query(`SELECT * FROM test_game_cardroyal WHERE end = 0 LIMIT 1`, [], function(err, rows, fields) { // 상대가 있을 경우
                            if(rows && rows.length > 0) {
                                card = cardroyal();
                                play_code = rows[0].play_code;
                                db.query(`INSERT INTO test_game_cardroyal (play_code, user_idx, king_data, card_data, deck_data, used_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                                    [
                                        play_code,
                                        user.user_idx,
                                        JSON.stringify(card.my_king_data),
                                        JSON.stringify(card.my_card_data),
                                        JSON.stringify(card.my_deck_data),
                                        JSON.stringify(card.my_used_data)
                                    ],
                                    function(err, rows, fields) {
                                        if(err) return false;
                                        let now = new Date().getTime();
                                        db.query(`INSERT INTO test_game_cardroyal_energy VALUES (?, ?, ?)`,
                                            [user.user_idx, play_code, now],
                                            function(err, rows, fields) {
                                                if(err) return false;
                                                socket.join(play_code);
                                                chat.to(play_code).emit('go');
                                            }
                                        );
                                        db.query(`UPDATE test_game_cardroyal_energy SET energy = ? WHERE play_code = ?`,
                                            [now, play_code],
                                            function(err, rows, fields) {
                                                if(err) return false;
                                            }
                                        );
                                    }
                                );
                            } else {
                                play_code = makeRandomName();
                                card = cardroyal();
                                db.query(`INSERT INTO test_game_cardroyal (play_code, user_idx, king_data, card_data, deck_data, used_data, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                                    [
                                        play_code,
                                        user.user_idx,
                                        JSON.stringify(card.my_king_data),
                                        JSON.stringify(card.my_card_data),
                                        JSON.stringify(card.my_deck_data),
                                        JSON.stringify(card.my_used_data)
                                    ],
                                    function(err, rows, fields) {
                                        if(err) return false;
                                        let now = new Date().getTime();
                                        db.query(`INSERT INTO test_game_cardroyal_energy VALUES (?, ?, ?)`,
                                            [user.user_idx, play_code, now],
                                            function(err, rows, fields) {
                                                if(err) return false;
                                                socket.join(play_code);
                                                socket.emit('ready');
                                            }
                                        );
                                    }
                                );
                            }
                        });
                    }
                }
            );
        });
        socket.on('set', function(data) {
            db.query(`SELECT
                        A.king_data AS my_king_data,
                        A.card_data AS my_card_data,
                        A.deck_data AS my_deck_data,
                        A.used_data AS my_used_data,
                        B.king_data AS rival_king_data,
                        B.card_data AS rival_card_data,
                        B.deck_data AS rival_deck_data,
                        B.used_data AS rival_used_data
                    FROM test_game_cardroyal A
                        INNER JOIN test_game_cardroyal B ON B.play_code = A.play_code AND B.user_idx != A.user_idx AND B.end = 0
                    WHERE 1=1
                        AND A.user_idx = ?
                        AND A.end = 0`,
                [user.user_idx],
                function(err, rows, fields) {
                    if(rows && rows.length > 0) {
                        res = rows[0];
                        play_code = res.play_code;
                        my_king_data = JSON.parse(res.my_king_data);
                        my_card_data = JSON.parse(res.my_card_data);
                        my_deck_data = JSON.parse(res.my_deck_data);
                        my_used_data = JSON.parse(res.my_used_data);
                        rival_king_data = JSON.parse(res.rival_king_data);
                        rival_card_data = JSON.parse(res.rival_card_data);
                        rival_deck_data = JSON.parse(res.rival_deck_data);
                        rival_used_data = JSON.parse(res.rival_used_data);
                        socket.emit('set', {
                            play_code: play_code,
                            my_king_data: my_king_data,
                            my_card_data: my_card_data,
                            my_deck_data: my_deck_data,
                            my_used_data: my_used_data,
                            rival_king_data: rival_king_data,
                            rival_card_data: rival_card_data,
                            rival_deck_data: rival_deck_data,
                            rival_used_data: rival_used_data,
                        });
                    } else {
                        db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? AND end = 0`, [user.user_idx], function(err, rows, fields) {
                            if(rows.length > 0) {
                                socket.emit('ready');
                            } else {
                                socket.emit('retry');
                            }
                        });
                    }
                }
            );
        });
        socket.on('energy', function() {
            db.query(`SELECT * FROM test_game_cardroyal_energy WHERE user_idx = ?`, [user.user_idx], function(err, rows, fields) {
                if(rows && rows.length > 0) {
                    let row = rows[0];
                    socket.emit('energy', {
                        now: row.energy,
                    });
                }
            });
        });
        socket.on('king_heal', function(data) {
            db.query(`SELECT A.*, (SELECT C.energy FROM test_game_cardroyal_energy C WHERE user_idx = A.user_idx) AS energy FROM test_game_cardroyal A WHERE A.user_idx = ? AND A.end = 0`, [user.user_idx], function(err, rows, fields) {
                let row = rows[0];
                let now = new Date().getTime();
                let energy = parseInt(now - parseInt(row.energy))/sec;
                energy = (energy > 10) ? 10 : energy;
                let card_data = JSON.parse(row.card_data);
                let heal_card = card_data[data.selected_id]; // 카드정보
                if(heal_card.energy > energy) {
                    socket.emit('energy_alert');
                    return ;
                }
                let king_data = JSON.parse(row.king_data);
                let deck_data = JSON.parse(row.deck_data);
                let used_data = JSON.parse(row.used_data);
                king_data.heal_hp += heal_card.heal; // 킹카드 처리
                card_data.splice(parseInt(data.selected_id), 1, null); // 사용카드 빼기
                card_data.push(heal_card); // 사용할 카드 제일 뒤로 보내기
                heal_card.target = 'my';
                used_data.push(heal_card); // 사용한 카드 제일 뒤로 보내기
                let idx = deck_data.indexOf(parseInt(data.selected_id)); // 덱카드 수정 [0, 1, 2, 3, 4] > [0, 4, 2, 3, 5]
                deck_data.splice(idx, 1, deck_data[4]);
                deck_data.splice(4, 1, used_data.length + 4);

                let my_king_data = JSON.stringify(king_data);
                let my_card_data = JSON.stringify(card_data);
                let my_deck_data = JSON.stringify(deck_data);
                let my_used_data = JSON.stringify(used_data);
                db.query(`UPDATE test_game_cardroyal SET king_data = ?, card_data = ?, deck_data = ?, used_data = ? WHERE user_idx = ? AND end = 0`,
                    [my_king_data, my_card_data, my_deck_data, my_used_data, user.user_idx],
                    function(err, rows, fields) {
                    }
                );
                let remain = energy - heal_card.energy;
                now = now - parseInt(remain)*sec;
                db.query(`UPDATE test_game_cardroyal_energy SET energy = ? WHERE user_idx = ?`,
                    [now, user.user_idx],
                    function(err, rows, fields) {
                        socket.emit('energy', { now: now });
                    }
                );
                socket.emit('my_action', { // my
                    action: 'heal',
                    selected_id: parseInt(data.selected_id),
                    king_data: king_data,
                    card_data: card_data,
                    deck_data: deck_data,
                    used_data: used_data,
                });
                socket.broadcast.emit('rival_action', { // rival
                    action: 'heal',
                    selected_id: parseInt(data.selected_id),
                    king_data: king_data,
                    // card_data: card_data,
                    // deck_data: deck_data,
                    // used_data: used_data,
                });
            });
        });
        socket.on('king_attack', function(data) {
            db.query(`SELECT A.*, (SELECT C.energy FROM test_game_cardroyal_energy C WHERE user_idx = A.user_idx) AS energy, (SELECT king_data FROM test_game_cardroyal B WHERE play_code = A.play_code AND user_idx != A.user_idx AND end = 0) AS rival_king_data FROM test_game_cardroyal A WHERE A.user_idx = ? AND end = 0`, [user.user_idx], function(err, rows, fields) {
                let row = rows[0];
                let now = new Date().getTime();
                let energy = parseInt(now - parseInt(row.energy))/sec;
                energy = (energy > 10) ? 10 : energy;
                let card_data = JSON.parse(row.card_data);
                let attack_card = card_data[data.selected_id]; // 카드정보
                if(attack_card.energy > energy) {
                    socket.emit('energy_alert');
                    return ;
                }
                let deck_data = JSON.parse(row.deck_data);
                let used_data = JSON.parse(row.used_data);
                let rival_king_data = JSON.parse(row.rival_king_data);
                rival_king_data.attack_hp += attack_card.attack; // 킹카드 처리
                card_data.splice(parseInt(data.selected_id), 1, null); // 사용카드 빼기
                card_data.push(attack_card); // 사용할 카드 제일 뒤로 보내기
                attack_card.target = 'rival';
                used_data.push(attack_card); // 사용한 카드 제일 뒤로 보내기
                let idx = deck_data.indexOf(parseInt(data.selected_id)); // 덱카드 수정 [0, 1, 2, 3, 4] > [0, 4, 2, 3, 5]
                deck_data.splice(idx, 1, deck_data[4]);
                deck_data.splice(4, 1, used_data.length + 4);
                if(rival_king_data.hp + rival_king_data.heal_hp - rival_king_data.attack_hp <= 0) {
                    db.query(`UPDATE test_game_cardroyal SET end = 1 WHERE play_code = ?`,
                        [row.play_code],
                        function(err, rows, fields) {
                        }
                    );
                    db.query(`DELETE FROM test_game_cardroyal_energy WHERE play_code = ?`,
                        [row.play_code],
                        function(err, rows, fields) {
                        }
                    );
                    socket.emit('end', '승리!');
                    socket.broadcast.emit('end', '패배...');
                }
                let king_data = JSON.stringify(rival_king_data);
                let my_card_data = JSON.stringify(card_data);
                let my_deck_data = JSON.stringify(deck_data);
                let my_used_data = JSON.stringify(used_data);
                db.query(`UPDATE test_game_cardroyal SET card_data = ?, deck_data = ?, used_data = ? WHERE user_idx = ? AND end = 0`,
                    [my_card_data, my_deck_data, my_used_data, user.user_idx],
                    function(err, rows, fields) {
                    }
                );
                db.query(`UPDATE test_game_cardroyal SET king_data = ? WHERE play_code = ? AND user_idx != ? AND end = 0`,
                    [king_data, row.play_code, user.user_idx],
                    function(err, rows, fields) {
                    }
                );
                let remain = energy - attack_card.energy;
                now = now - parseInt(remain)*sec;
                db.query(`UPDATE test_game_cardroyal_energy SET energy = ? WHERE user_idx = ?`,
                    [now, user.user_idx],
                    function(err, rows, fields) {
                        socket.emit('energy', { now: now });
                    }
                );
                socket.emit('my_action', { // my
                    action: 'attack',
                    selected_id: parseInt(data.selected_id),
                    rival_king_data: rival_king_data,
                    card_data: card_data,
                    deck_data: deck_data,
                    used_data: used_data,
                });
                socket.broadcast.emit('rival_action', { // rival
                    action: 'attack',
                    selected_id: parseInt(data.selected_id),
                    my_king_data: rival_king_data,
                    // card_data: card_data,
                    // deck_data: deck_data,
                    // used_data: used_data,
                });
            });
        });
        socket.on('result', function(data) {
            db.query(`SELECT * FROM test_game_cardroyal WHERE user_idx = ? ORDER BY game_idx DESC LIMIT 1`,
                [user.user_idx],
                function(err, rows, fields) {
                    let res = JSON.parse(rows[0].used_data);
                    socket.emit('result', res);
                }
            );
        });
        socket.on('client-disconnect', function() { // event : client-disconnect - 채팅방에서 나가기
            // chat.emit('client-disconnect', socket.nickname); // 채팅방 전체 참여자에게 메시지 전송
            socket.emit('client-disconnect', user.user_name); // 자기 자신에게만 메시지 전송
            // socket.broadcast.emit('client-disconnect', socket.nickname); // 자기 자신을 제외한 전체 참여자에게 메시지 전송
            // chat.to(id).emit('client-disconnect', socket.nickname); // 특정 참여자에게 메시지 전송
            socket.disconnect(); // 채팅방 나가기
        });
        socket.on('disconnect', function() { // 접속 끊어진 사용자 로그 남기기
            // if(socket.nickname) console.log('disconnect : ' + socket.nickname);
            socket.disconnect();
        });
    });
    return chat;
}
