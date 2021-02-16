'use strict';

class Clothes {

    constructor(type, gender, size, color, image) {
        this.type = type;
        this.gender = gender;
        this.size = size;
        this.color = color;
        this.image = image;
    }

    set type(value) {
        let check_type = ['tshirt', 'skirt', 'pants'];
        this._type = (check_type.indexOf(value) === -1) ? 'etc' : value;
    }
    set gender(value) {
        let check_gender = ['female', 'male'];
        this._gender = (check_gender.indexOf(value) === -1) ? 'female' : value;
    }
    set image(value) {
        this._image = 'img/' + this.color + '_' + value + '.png';
    }

    get type() {
        return this._type;
    }
    get gender() {
        return this._gender;
    }
    get image() {
        return this._image;
    }

}

const clothes = [
    new Clothes('tshirt', 'female', 'large', 'pink', 't'),
    new Clothes('skirt', 'female', 'large', 'pink', 's'),
    new Clothes('pants', 'female', 'large', 'pink', 'p'),
    new Clothes('tshirt', 'female', 'small', 'pink', 't'),
    new Clothes('skirt', 'female', 'small', 'pink', 's'),
    new Clothes('pants', 'female', 'small', 'pink', 'p'),
    new Clothes('tshirt', 'female', 'large', 'yellow', 't'),
    new Clothes('skirt', 'female', 'large', 'yellow', 's'),
    new Clothes('pants', 'female', 'large', 'yellow', 'p'),
    new Clothes('tshirt', 'female', 'small', 'yellow', 't'),
    new Clothes('skirt', 'female', 'small', 'yellow', 's'),
    new Clothes('pants', 'female', 'small', 'yellow', 'p'),
    new Clothes('tshirt', 'male', 'large', 'blue', 't'),
    new Clothes('skirt', 'male', 'large', 'blue', 's'),
    new Clothes('pants', 'male', 'large', 'blue', 'p'),
    new Clothes('tshirt', 'male', 'small', 'blue', 't'),
    new Clothes('skirt', 'male', 'small', 'blue', 's'),
    new Clothes('pants', 'male', 'small', 'blue', 'p'),
];

let Shopping = function() {
    function init() {
        displayItems(clothes);
        setEventListener(clothes);
    }
    function displayItems(items) {
        const container = document.querySelector('.items');
        container.innerHTML = items.map(item => createHTMLString(item)).join('');
    }
    function createHTMLString(item) {
        return `
        <li class="item">
            <img src="${item.image}" alt="${item.type}" class="item__thumbnail">
            <span class="item__description">${item.size} ${item.gender}</span>
        </li>`;
    }
    function onButtonClick(event, items) {
        const key = event.target.dataset.key;
        const value = event.target.dataset.value;
        if(key == null || value == null) return ;
        displayItems(items.filter(item => item[key] === value));
    }
    function setEventListener(items) {
        const logo = document.querySelector('.logo');
        const buttons = document.querySelector('.buttons');
        logo.addEventListener('click', () => displayItems(items));
        buttons.addEventListener('click', (event) => {
            onButtonClick(event, items);
        });
    }
    return {
        init: init
    }
}();

Shopping.init();



/* function displayItems(items) {
    const container = document.querySelector('.items');
    container.innerHTML = items.map(item => createHTMLString(item)).join('');
}

function createHTMLString(item) {
    return `
    <li class="item">
        <img src="${item.image}" alt="${item.type}" class="item__thumbnail">
        <span class="item__description">${item.size} ${item.gender}</span>
    </li>`;
}

function onButtonClick(event, items) {
    const key = event.target.dataset.key;
    const value = event.target.dataset.value;
    if(key == null || value == null) return ;
    displayItems(items.filter(item => item[key] === value));
}

function setEventListener(items) {
    const logo = document.querySelector('.logo');
    const buttons = document.querySelector('.buttons');
    logo.addEventListener('click', () => displayItems(items));
    buttons.addEventListener('click', (event) => {
        onButtonClick(event, items);
    });
}

function loadItems() {
    return fetch('data/data.json')
    .then(response => response.json())
    .then(json => json.items);
}

loadItems()
.then(items => {
    console.log(items);
    displayItems(items);
    setEventListener(items);
})
.catch(error => console.log(error)); */

