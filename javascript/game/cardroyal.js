'use strict';

function Cardroyal() {
    let info = {
        end: false,
        selected_id: null,
    }

    let rival_card = document.querySelector('#rival-card');
    let rival_king = document.querySelector('#rival-king');
    let rival_deck = document.querySelector('#rival-deck');
    let rival_energy = document.querySelector('#rival-energy');
    let rival_deck_data = [];
    let rival_king_data = {};
    let rival_card_data = [];
    let rival_used_card_data = [];
    let rival_info_data = {
        energy: 10,
        attack: 0,
        heal: 0,
    }

    let my_card = document.querySelector('#my-card');
    let my_king = document.querySelector('#my-king');
    let my_deck = document.querySelector('#my-deck');
    let my_energy = document.querySelector('#my-energy');
    let my_deck_data = []; // 내 전체 카드 - 랜덤으로 저장
    let my_king_data = {}; // 히어로 카드
    let my_card_data = { // 내 카드
        'card1': null,
        'card2': null,
        'card3': null,
        'card4': null,
        'ready': null,
    }
    let my_used_card_data = []; // 사용된 카드
    let my_info_data = {
        energy: 10,
        attack: 0,
        heal: 0,
    }
    let my = new Mycard();
    let rival = new Rivalcard();
    init();
    // function rival_card_update() {
    //     document.querySelectorAll('.rival_info .card').forEach(function(item) {
    //         if(info.selected_id) item.classList.add('possible');
    //         else item.classList.remove('possible');
    //     });
    // }
    function card_view(card_data, index, item, who) {
        let card = document.querySelector('.card-hidden .card').cloneNode(true);
        card.id = who + '_' + index;        
        switch(card_data.card) {
            case "king":
                card.querySelector('.card-hp').textContent = card_data.hp;
                card.querySelector('.card-name').textContent = 'KING';
                card.querySelector('.card-energy').hidden = true;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').hidden = true;
                break;
            case "attack":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-A';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').hidden = true;
                // this.target = ['king']; // king, card
                break;
            case "heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-H';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').textContent = card_data.heal;
                // this.target = ['king']; // king, card
                break;
            case "attack_heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-AH';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').textContent = card_data.heal;
                // this.target = ['king']; // king, card
                break;
        }
        item.appendChild(card);
        if(who === 'rival') {
            card.addEventListener('mouseover', function() {
                if(info.selected_id) card.classList.add('possible');
                else card.classList.remove('possible');
            });
        }
        card.addEventListener('click', function() {
            if(info.end) return ;
            if(who === 'my') {
                if(info.selected_id) document.querySelector('#my_'+info.selected_id).classList.remove('selected');
                info.selected_id = this.id.split('_')[1];
                let selected_card = (info.selected_id === 'king') ? my_king_data : my_deck_data[info.selected_id];
                document.querySelector('#my_'+info.selected_id).classList.add('selected');
                console.log(selected_card);
                if(selected_card.card === 'attack') { // 상대
                    console.log(selected_card.target);
                } else if(selected_card.card === 'heal') { // 나
                    console.log(selected_card.target);
                } else if(selected_card.card === 'attack_heal') { // 양쪽
                    console.log(selected_card.target);
                }
                // rival_card_update();
            // 내 카드 선택
                /* if(idx === 'king') {
                    if(info.select_card !== 0 && !info.select_card) return ;
                    let att = rival_card_data[info.select_card];
                    my_king_data.hp -= att.att;
                    rival_used_card_data.push(my_card_data.splice(info.select_card, 1, null)[0]);
                    document.querySelector('#rivalfield_'+(info.select_card+1)).classList.remove('selected');
                    document.querySelector('#rivalfield_'+(info.select_card+1)).classList.add('used');
                    if(my_king_data.hp < 1) {
                        my_king_data.hp = 0;
                        info.end = true;
                        console.log('Rival Win!');
                    }
                    info.select_card = null;
                    this.querySelector('.card-hp').textContent = my_king_data.hp;
                } else {
                    if(!info.myturn) return ;
                    if(!my_deck_data[parseInt(idx)-1]) return ;
                    let _card = my_deck_data[parseInt(idx)-1];
                    if(my_info_data.energy < _card.energy) return ;
                    my.energy(_card.energy);
                    my_card_data.push(my_deck_data.splice(parseInt(idx)-1, 1, null)[0]);
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
                } */
            } else if(who === 'rival') {
                if(info.selected_id) {
                    let selected_card = (info.selected_id === 'king') ? my_king_data : my_deck_data[info.selected_id];
                    console.log(selected_card);
                    let attack_selected_id = this.id.split('_')[1];
                    let attack_card = (attack_selected_id === 'king') ? rival_king_data : rival_deck_data[selected_card];
                    console.log(attack_card);
                    this.querySelector('.card-hp').textContent -= selected_card.attack
                    // this.childNode
                    // DATA 업데이트 & 카드 업데이트
                }
                /* if(idx === 'king') {
                    if(info.select_card !== 0 && !info.select_card) return ;
                    let att = my_card_data[info.select_card];
                    rival_king_data.hp -= att.att;
                    my_used_card_data.push(my_card_data.splice(info.select_card, 1, null)[0]);
                    document.querySelector('#myfield_'+(info.select_card+1)).classList.remove('selected');
                    document.querySelector('#myfield_'+(info.select_card+1)).classList.add('used');
                    if(rival_king_data.hp < 1) {
                        rival_king_data.hp = 0;
                        info.end = true;
                        console.log('You Win!');
                    }
                    info.select_card = null;
                    this.querySelector('.card-hp').textContent = rival_king_data.hp;
                } else {
                    if(info.myturn) return ;
                    if(!rival_deck_data[parseInt(idx)-1]) return ;
                    let _card = rival_deck_data[parseInt(idx)-1];
                    if(rival_info_data.energy < _card.energy) return ;
                    rival.energy(_card.energy);
                    rival_card_data.push(rival_deck_data.splice(parseInt(idx)-1, 1, null)[0]);
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
                } */
            }
        });
    }
    function init() {
        card_view(my_king_data, 'king', my_king, 'my');
        my_deck_data.forEach(function(v, k) {
            card_view(v, k, my_deck, 'my');
        });
        card_view(rival_king_data, 'king', rival_king, 'rival');
        rival_deck_data.forEach(function(v, k) {
            card_view(v, k, rival_deck, 'rival');
        });
        // my_energy.textContent = my_info_data.energy;
        // rival_energy.textContent = rival_info_data.energy;
        // document.querySelector('#change_turn').addEventListener('click', function() {
        //     if(info.end) return ;
        //     info.myturn = !info.myturn;
        //     if(info.myturn) {
        //         document.querySelector('.rival_info').classList.remove('turn');
        //         document.querySelector('.my_info').classList.add('turn');
        //         my_info_data.energy = 10;
        //         my_energy.textContent = my_info_data.energy;
        //     } else {
        //         document.querySelector('.my_info').classList.remove('turn');
        //         document.querySelector('.rival_info').classList.add('turn');
        //         info.ready = true;
        //         rival_info_data.energy = 10;
        //         rival_energy.textContent = rival_info_data.energy;
        //     }
        // });
    }
    function create_card(opt) { // 5 + 1
        this.card = opt;
        switch(opt) {
            case "king":
                this.hp = Math.ceil(Math.random() * 5) + 25; // 26~30
                break;
            case "attack":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.attack = this.energy + 1;
                this.target = ['king']; // king, card
                break;
            case "heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.heal = this.energy + 1;
                this.target = ['king']; // king, card
                break;
            case "attack_heal":
                this.energy = Math.ceil(Math.random() * 5) + 1; // 2~6
                this.attack = this.energy - 1;
                this.heal = this.energy - 1;
                this.target = ['king']; // king, card
                break;
        }
    }
    function Mycard() {
        king_card();
        attack_card(4);
        heal_card(3);
        attack_heal_card(1);
        function king_card() {
            my_king_data = new create_card('king');
        }
        function attack_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack');
                my_deck_data.push(_card);
            }
        }
        function heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('heal');
                my_deck_data.push(_card);
            }
        }
        function attack_heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack_heal');
                my_deck_data.push(_card);
            }
        }
    }
    function Rivalcard() {
        king_card();
        attack_card(4);
        heal_card(3);
        attack_heal_card(1);
        function king_card() {
            rival_king_data = new create_card('king');
        }
        function attack_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack');
                rival_deck_data.push(_card);
            }
        }
        function heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('heal');
                rival_deck_data.push(_card);
            }
        }
        function attack_heal_card(count) {
            for(let i=0; i<count; i++) {
                let _card = new create_card('attack_heal');
                rival_deck_data.push(_card);
            }
        }
    }
}
