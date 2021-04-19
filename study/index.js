const btn1 = document.querySelector('#btn1');
const nav = document.querySelector('#nav');
btn1.addEventListener('click', function() {
    nav.classList.toggle('active');
    btn1.classList.toggle('active');
});


const btn2 = document.querySelector('#btn2');
const container = document.querySelector('#container');
btn2.addEventListener('click', function() {
    createNotif();
});
function createNotif() {
    const notif = document.createElement('div');
    notif.classList.add('toast');
    notif.innerText = 'notification!!!!!!!';
    container.appendChild(notif);
    setTimeout(function() {
        notif.remove();
    }, 3000);
}


const btn3 = document.querySelector('#btn3');
const close3 = document.querySelector('#close3');
const popup_container = document.querySelector('#popup_container');
btn3.addEventListener('click', function() {
    setTimeout(function() {
        popup_container.classList.add('active');
    }, 200);
});
close3.addEventListener('click', function() {
    setTimeout(function() {
        popup_container.classList.remove('active');
    }, 200);
});
