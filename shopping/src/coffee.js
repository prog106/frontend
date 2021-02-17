'use strict';

/* 
커피머신
가격 1잔당 300원
커피 1잔 기준
- 커피가루 : 15g
- 프림 : 12g
- 설탕 : 9g
- 물 : 180mL
*/

class Machine {
    constructor(coffee, cream, sugar, water) {
        this.coffee_mat = {
            coffee: 15,
            cream: 12,
            sugar: 9,
            water: 180,
            coin: 300
        };
        this.coffee = coffee;
        this.cream = cream;
        this.sugar = sugar;
        this.water = water;
        this.coin = 0;
        this.profit = 0;
    }

    set coffee(value) {
        this._coffee = value < this.coffee_mat.coffee ? 0 : value;
    }
    set cream(value) {
        this._cream = value < this.coffee_mat.cream ? 0 : value;
    }
    set sugar(value) {
        this._sugar = value < this.coffee_mat.sugar ? 0 : value;
    }
    set water(value) {
        this._water = value < this.coffee_mat.water ? 0 : value;
    }

    get coffee() {
        return this._coffee;
    }
    get cream() {
        return this._cream;
    }
    get sugar() {
        return this._sugar;
    }
    get water() {
        return this._water;
    }

    dashboard() {
        console.log(`커피 : ${this.coffee} g
프림 : ${this.cream} g
설탕 : ${this.sugar} g
물 : ${this.water} mL
잔액 : ${this.coin} 원
이익 : ${this.profit} 원`);
    }

    insert_coin(coin) {
        console.warn(coin + '원 입금되었습니다.');
        this.coin += coin;
    }

    remain_coin() {
        console.warn(this.coin + '원 반환되었습니다.');
        this.coin = 0;
    }

    request_coffee() {
        if(this.coin < this.coffee_mat.coin) {
            console.error('잔액이 부족합니다.');
            return false;
        }
        if(!this.coffee || !this.cream || !this.sugar || !this.water) {
            console.error('커피 재료가 부족합니다.');
            this.dashboard();
            return false;
        }
        return true;
    }

    make_coffee() {
        this.profit += this.coffee_mat.coin;
        this.coin -= this.coffee_mat.coin;
        this.coffee -= this.coffee_mat.coffee;
        this.cream -= this.coffee_mat.cream;
        this.sugar -= this.coffee_mat.sugar;
        this.water -= this.coffee_mat.water;
        console.warn('커피 1잔 나왔습니다.');
    }

    request(code) {
        if(this.coin < 1) {
            console.error('잔액이 없습니다.');
            return false;
        }
        switch(code) {
            case "coffee":
                console.log('커피 1잔 요청');
                if(this.request_coffee()) this.make_coffee();
            break;
            case "refund":
                console.log('잔액 반환 요청');
                this.remain_coin();
            break;
            default:
                console.warn('잘못된 요청입니다.');
            break;
        }
    }

    charge_coffee_material(coffee, cream, sugar, water) {
        this.coffee += coffee;
        this.cream += cream;
        this.sugar += sugar;
        this.water += water;
        console.warn('커피 재료가 보충되었습니다.');
    }
}

let machine = new Machine(200, 200, 200, 4000);

machine.insert_coin(1000);

machine.request('coffee');
machine.request('coffee');
machine.request('coffee');
// machine.charge_coffee_material(40, 40, 40, 500);
machine.request('coffee');

machine.request('refund');
