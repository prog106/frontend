const db = require('../common.js').db();
module.exports = function() {
    let my_random_data = []; // 랜덤카드
    let my_hero_data = {}; // 히어로카드
    let rival_random_data = []; // 랜덤카드
    let rival_hero_data = {}; // 히어로카드
    function Create_card(hero) { // 5 + 1
        if(hero) {
            this.att = Math.ceil(Math.random() * 2); // 1~5
            this.hp = Math.ceil(Math.random() * 5) + 25; // 1~5
            this.hero = hero;
        } else {
            this.att = Math.ceil(Math.random() * 5); // 1~5
            this.hp = Math.ceil(Math.random() * 5); // 1~5
            this.cost = Math.floor((this.att + this.hp) / 2);
        }
    }
    function hero_card() {
        return new Create_card(true);
    }
    function card(count) {
        let _card = [];
        for(let i=0; i<count; i++) {
            _card.push(new Create_card());
        }
        return _card;
    }
    function load() {
        let response = {};
        // 내 카드 정보 : 랜덤5, 히어로1
        my_random_data = card(5);
        my_hero_data = hero_card();
        // 상대 카드 정보 : 랜덤5, 히어로1
        rival_random_data = card(5);
        rival_hero_data = hero_card();

        response.my_random_data = my_random_data;
        response.my_hero_data = my_hero_data;
        response.rival_random_data = rival_random_data;
        response.rival_hero_data = rival_hero_data;
        // db.query(`SELECT * FROM test_game_minesweeper ORDER BY game_idx DESC LIMIT 10`,
        //     [],
        //     function(err, rows, fields) {
        //         console.log(err);
        //         console.log(rows);
        //         // chat.emit('ranking', rows);
        //     }
        // );
        return response;
    }
    return {
        load: load,
    }
}
