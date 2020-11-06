'use strict';

function loadItems() {
    return fetch('data/data.json')
    .then(response => response.json())
    .then(json => json.items);
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
        //console.log(event);
    });
}


loadItems()
.then(items => {
    displayItems(items);
    setEventListener(items);
})
.catch(error => console.log(error));