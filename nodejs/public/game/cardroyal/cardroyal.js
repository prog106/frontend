'use strict';

function Cardroyal() {
    let info = {
        end: false,
        selected_id: null,
        selected_card: {},
    }

    let rival_card = document.querySelector('#rival-card');
    let rival_king = document.querySelector('#rival-king');
    let rival_deck = document.querySelector('#rival-deck');
    let rival_deck_ready = document.querySelector('#rival-deck-ready');
    let rival_energy = document.querySelector('#rival-energy');
    let rival_deck_data = [];
    let rival_king_data = {};
    let rival_card_data = [];
    let rival_used_card_data = [];
    let rival_info_data = {
        energy: 0,
        attack: 0,
        heal: 0,
    }

    let my_card = document.querySelector('#my-card');
    let my_king = document.querySelector('#my-king');
    let my_deck = document.querySelector('#my-deck');
    let my_deck_ready = document.querySelector('#my-deck-ready');
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
        energy: 0,
        attack: 0,
        heal: 0,
    }
    const socket = io('http://localhost:3000/cardroyal'); // socket.io 접속
    init();
    function king_hp() { // HP 처리
        if(info.end) return ;
        socket.emit('king_hp');
        return false;
    }
    function after_action() { // 공격/힐링 후 처리
        my_used_card_data.push(my_deck_data.splice(parseInt(info.selected_id), 1, null)[0]);
        my_deck_data.push(info.selected_card);
        let _card = document.querySelector('#my_'+info.selected_id);
        _card.style.opacity = 0;
        setTimeout(function() {
            let new_card = my_deck_ready.childNodes[0];
            new_card.classList.remove('noselect');
            _card.parentNode.insertBefore(new_card, _card);
            _card.parentNode.removeChild(_card);
            card_view(my_deck_data[my_used_card_data.length + 4], my_used_card_data.length + 4, my_deck_ready, 'my');
        }, 250);
        document.querySelectorAll('.possible').forEach(function(v) {
            v.classList.remove('possible');
        });
        info.selected_id = null;
        info.selected_card = null;
    }
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
                break;
            case "heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-H';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').hidden = true;
                card.querySelector('.card-heal').textContent = card_data.heal;
                break;
            case "attack_heal":
                card.querySelector('.card-hp').hidden = true;
                card.querySelector('.card-name').textContent = 'CARD-AH';
                card.querySelector('.card-energy').textContent = card_data.energy;
                card.querySelector('.card-attack').textContent = card_data.attack;
                card.querySelector('.card-heal').textContent = card_data.heal;
                break;
        }
        setTimeout(function() {
            item.appendChild(card);
        }, 250);
        if(item.id === 'my-deck-ready') card.classList.add('noselect');
        card.addEventListener('click', function() {
            if(info.end) return ;
            if(this.classList.contains('noselect')) return ;
            if(who === 'my') {
                let ex = this.id.split('_');
                if(ex[1] === 'king') {
                    if(!this.classList.contains('possible')) return ;
                    if(energy()) return ;
                    my_king_data.heal_hp += info.selected_card.heal;
                    if(king_hp()) return ;
                    return ;
                }
                if(info.selected_id) document.querySelector('#my_'+info.selected_id).classList.remove('selected');
                info.selected_id = ex[1];
                info.selected_card = my_deck_data[info.selected_id];
                document.querySelector('#my_'+info.selected_id).classList.add('selected');
                document.querySelectorAll('.possible').forEach(function(v) {
                    v.classList.remove('possible');
                });
                if(info.selected_card.card === 'attack') { // 상대
                    document.querySelector('#rival_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                } else if(info.selected_card.card === 'heal') { // 나
                    document.querySelector('#my_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                } else if(info.selected_card.card === 'attack_heal') { // 양쪽
                    document.querySelector('#my_king').classList.add('possible');
                    document.querySelector('#rival_king').classList.add('possible');
                    // console.log(info.selected_card.target);
                }
            } else if(who === 'rival') {
                if(info.selected_id && info.selected_card) {
                    // 공격카드 범위 체크
                    if(!this.classList.contains('possible')) return ;
                    if(energy()) return ;
                    rival_king_data.attack_hp += info.selected_card.attack;
                    socket.emit('king_attack', {
                        rival_king_data: rival_king_data
                    });
                    if(king_hp()) return ;
                }
            }
        });
    }
    function energy() {
        if(info.selected_card.energy <= my_info_data.energy) {
            my_info_data.energy -= info.selected_card.energy;
            document.querySelector('#my-energy').textContent = my_info_data.energy;
            return false;
        }
        return true;
    }
    function init() {
        socket.emit('set', true);
        socket.on('set', function(res) {
            my_deck_data = res.my_deck_data;
            my_king_data = res.my_king_data;
            card_view(my_king_data, 'king', my_king, 'my');
            my_deck_data.forEach(function(v, k) {
                if(k == 4) card_view(v, k, my_deck_ready, 'my');
                else card_view(v, k, my_deck, 'my');
            });
            rival_deck_data = res.rival_deck_data;
            rival_king_data = res.rival_king_data;
            card_view(rival_king_data, 'king', rival_king, 'rival');
            rival_deck_data.forEach(function(v, k) {
                if(k == 4) card_view(v, k, rival_deck_ready, 'rival');
                else card_view(v, k, rival_deck, 'rival');
            });
        });
        socket.on('energy', function(res) {
            if(my_info_data.energy < 10) my_info_data.energy += res;
            if(rival_info_data.energy < 10) rival_info_data.energy += res;
            document.querySelector('#my-energy').textContent = my_info_data.energy;
            document.querySelector('#rival-energy').textContent = rival_info_data.energy;
        });
        socket.on('end', function(res) {
            
            alert(res);
            window.location.href = '/';
        });
        socket.on('king_hp', function(res) {
            document.querySelector('#rival_king .card-hp').textContent = res.rival_hp;
            document.querySelector('#my_king .card-hp').textContent = res.my_hp;
            if(res.end) {
                info.end = true;
                return ;
            }
            after_action();
        });
    }
}
