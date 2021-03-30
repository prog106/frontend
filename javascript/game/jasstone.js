'use strict';

function Jasstone() {
    let rival_hero = document.querySelector('#rival-hero');
    let rival_deck = document.querySelector('#rival-deck');
    let my_hero = document.querySelector('#my-hero');
    let my_deck = document.querySelector('#my-deck');
    let rival_data = [];
    let rival_hero_data = {};
    let my_data = [];
    let my_hero_data = {};
    exec();
    function exec() {
        rival_card();
        my_card();
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
    function card_view(card_data, item) {
        let card = document.querySelector('.card-hidden .card').cloneNode(true);
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

        });
    }
    function rival_card() {
        for(let i=0; i<5; i++) {
            rival_data.push(new create_card());
        }
        rival_data.forEach(function(v) {
            card_view(v, rival_deck);
        });
        rival_hero_data = new create_card(true);;
        card_view(rival_hero_data, rival_hero);
    }
    function my_card() {
        for(let i=0; i<5; i++) {
            my_data.push(new create_card());
        }
        my_data.forEach(function(v) {
            card_view(v, my_deck);
        });
        my_hero_data = new create_card(true);
        card_view(my_hero_data, my_hero);
    }
}
