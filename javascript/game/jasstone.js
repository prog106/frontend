'use strict';

function Jasstone() {
    let info = {
        end: false,
        ready: false,
        myturn: true, // true : 나, false : 상대
        select_id: null,
        select_card: null,
    }

    let rival_card = document.querySelector('#rival-card');
    let rival_hero = document.querySelector('#rival-hero');
    let rival_deck = document.querySelector('#rival-deck');
    let rival_cost = document.querySelector('#rival-cost');
    let rival_data = [];
    let rival_hero_data = {};
    let rival_card_data = [];
    let rival_used_card_data = [];
    let rival_info_data = {
        cost: 10,
    }

    let my_card = document.querySelector('#my-card');
    let my_hero = document.querySelector('#my-hero');
    let my_deck = document.querySelector('#my-deck');
    let my_cost = document.querySelector('#my-cost');
    let my_data = []; // 랜덤카드
    let my_hero_data = {}; // 히어로카드
    let my_card_data = []; // 선택한 카드
    let my_used_card_data = []; // 사용된 카드
    let my_info_data = {
        cost: 10,
    }
    let my = new Myturn();
    let rival = new Rivalturn();
    init();
    function card_view(card_data, index, item, turn) {
        let card = document.querySelector('.card-hidden .card').cloneNode(true);
        card.id = turn + '_' + index;
        card.querySelector('.card-att').textContent = card_data.att;
        card.querySelector('.card-hp').textContent = card_data.hp;
        if(card_data.hero) {
            card.querySelector('.card-name').textContent = 'HERO';
            card.querySelector('.card-cost').hidden = card_data.hero;
        } else {
            card.querySelector('.card-name').hidden = true;
            card.querySelector('.card-cost').textContent = card_data.cost;
        }
        item.appendChild(card);
        card.addEventListener('click', function() {
            if(info.end) return ;
            // 카드 옮기기 & 데이터 업데이트
            let _split = this.id.split('_');
            let turn = _split[0];
            let idx = _split[1];
            if(turn === 'my') {
                if(idx === 'hero') {
                    if(info.select_card !== 0 && !info.select_card) return ;
                    let att = rival_card_data[info.select_card];
                    my_hero_data.hp -= att.att;
                    rival_used_card_data.push(my_card_data.splice(info.select_card, 1, null)[0]);
                    document.querySelector('#rivalfield_'+(info.select_card+1)).classList.remove('selected');
                    document.querySelector('#rivalfield_'+(info.select_card+1)).classList.add('used');
                    if(my_hero_data.hp < 1) {
                        my_hero_data.hp = 0;
                        info.end = true;
                        console.log('Rival Win!');
                    }
                    info.select_card = null;
                    this.querySelector('.card-hp').textContent = my_hero_data.hp;
                } else {
                    if(!info.myturn) return ;
                    if(!my_data[parseInt(idx)-1]) return ;
                    let _card = my_data[parseInt(idx)-1];
                    if(my_info_data.cost < _card.cost) return ;
                    my.cost(_card.cost);
                    my_card_data.push(my_data.splice(parseInt(idx)-1, 1, null)[0]);
                    this.id = 'myfield_' + my_card_data.length;
                    my_card.appendChild(this);
                    my.card(1);
                    this.addEventListener('click', function() {
                        if(info.end) return ;
                        let _split = this.id.split('_');
                        let turn = _split[0];
                        let idx = _split[1];
                        if(!info.myturn) { // 공격 당하기
                            if(info.select_card !== 0 && !info.select_card) return ;
                            let att = rival_card_data[info.select_card];
                            my_card_data[parseInt(idx)-1].hp -= att.att;
                            rival_used_card_data.push(rival_card_data.splice(info.select_card, 1, null)[0]);
                            document.querySelector('#rivalfield_'+(info.select_card+1)).classList.remove('selected');
                            document.querySelector('#rivalfield_'+(info.select_card+1)).classList.add('used');
                            if(my_card_data[parseInt(idx)-1].hp < 1) {
                                my_card_data[parseInt(idx)-1].hp = 0;
                                this.classList.add('used');
                            }
                            info.select_card = null;
                            this.querySelector('.card-hp').textContent = my_card_data[parseInt(idx)-1].hp;
                        } else {
                            if(!info.ready) return ;
                            if(!my_card_data[parseInt(idx)-1]) return ;
                            if(info.select_id) document.querySelector('#'+info.select_id).classList.remove('selected');
                            this.classList.add('selected');
                            info.select_id = this.id;
                            if(turn === 'myfield') {
                                info.select_card = parseInt(idx)-1; // 공격 카드 선택
                                console.log('rival attack');
                            }
                        }
                    });
                }
            } else if(turn === 'rival') {
                if(idx === 'hero') {
                    if(info.select_card !== 0 && !info.select_card) return ;
                    let att = my_card_data[info.select_card];
                    rival_hero_data.hp -= att.att;
                    my_used_card_data.push(my_card_data.splice(info.select_card, 1, null)[0]);
                    document.querySelector('#myfield_'+(info.select_card+1)).classList.remove('selected');
                    document.querySelector('#myfield_'+(info.select_card+1)).classList.add('used');
                    if(rival_hero_data.hp < 1) {
                        rival_hero_data.hp = 0;
                        info.end = true;
                        console.log('You Win!');
                    }
                    info.select_card = null;
                    this.querySelector('.card-hp').textContent = rival_hero_data.hp;
                } else {
                    if(info.myturn) return ;
                    if(!rival_data[parseInt(idx)-1]) return ;
                    let _card = rival_data[parseInt(idx)-1];
                    if(rival_info_data.cost < _card.cost) return ;
                    rival.cost(_card.cost);
                    rival_card_data.push(rival_data.splice(parseInt(idx)-1, 1, null)[0]);
                    this.id = 'rivalfield_' + rival_card_data.length;
                    rival_card.appendChild(this);
                    rival.card(1);
                    this.addEventListener('click', function() {
                        if(info.end) return ;
                        let _split = this.id.split('_');
                        let turn = _split[0];
                        let idx = _split[1];
                        if(info.myturn){ // 공격 당하기
                            if(info.select_card !== 0 && !info.select_card) return ;
                            let att = my_card_data[info.select_card];
                            rival_card_data[parseInt(idx)-1].hp -= att.att;
                            my_used_card_data.push(my_card_data.splice(info.select_card, 1, null)[0]);
                            document.querySelector('#myfield_'+(info.select_card+1)).classList.remove('selected');
                            document.querySelector('#myfield_'+(info.select_card+1)).classList.add('used');
                            if(rival_card_data[parseInt(idx)-1].hp < 1) {
                                rival_card_data[parseInt(idx)-1].hp = 0;
                                this.classList.add('used');
                            }
                            info.select_card = null;
                            this.querySelector('.card-hp').textContent = rival_card_data[parseInt(idx)-1].hp;
                        } else {
                            if(!info.ready) return ;
                            if(!rival_card_data[parseInt(idx)-1]) return ;
                            if(info.select_id) document.querySelector('#'+info.select_id).classList.remove('selected');
                            this.classList.add('selected');
                            info.select_id = this.id;
                            if(turn === 'rivalfield') {
                                info.select_card = parseInt(idx)-1; // 공격 카드 선택
                                console.log('my attack');
                            }
                        }
                    });
                }
            }
        });
    }
    function init() {
        my_cost.textContent = my_info_data.cost;
        rival_cost.textContent = rival_info_data.cost;
        document.querySelector('#change_turn').addEventListener('click', function() {
            if(info.end) return ;
            info.myturn = !info.myturn;
            if(info.myturn) {
                document.querySelector('.rival_info').classList.remove('turn');
                document.querySelector('.my_info').classList.add('turn');
                my_info_data.cost = 10;
                my_cost.textContent = my_info_data.cost;
            } else {
                document.querySelector('.my_info').classList.remove('turn');
                document.querySelector('.rival_info').classList.add('turn');
                info.ready = true;
                rival_info_data.cost = 10;
                rival_cost.textContent = rival_info_data.cost;
            }
        });
    }
    function create_card(hero) { // 5 + 1
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
    function Myturn() {
        hero_card();
        card(5);
        function hero_card() {
            my_hero_data = new create_card(true);
            card_view(my_hero_data, 'hero', my_hero, 'my');
        }
        function card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card();
                my_data.push(_card);
                card_view(_card, my_data.length, my_deck, 'my');
            }
        }
        function cost(cost) {
            my_info_data.cost -= cost;
            my_cost.textContent = my_info_data.cost;
        }
        return {
            card: card,
            cost: cost,
        }
    }
    function Rivalturn() {
        hero_card();
        card(5);
        function hero_card() {
            rival_hero_data = new create_card(true);
            card_view(rival_hero_data, 'hero', rival_hero, 'rival');
        }
        function card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card();
                rival_data.push(_card);
                card_view(_card, rival_data.length, rival_deck, 'rival');
            }
        }
        function cost(cost) {
            rival_info_data.cost -= cost;
            rival_cost.textContent = rival_info_data.cost;
        }
        return {
            card: card,
            cost: cost,
        }
    }
}
