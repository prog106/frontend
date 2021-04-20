const btn1 = document.querySelector('#btn1');
const nav = document.querySelector('#nav');
btn1.addEventListener('click', function() {
    nav.classList.toggle('active');
    btn1.classList.toggle('active');
});


const btn2 = document.querySelector('#btn2');
const container = document.querySelector('#container');
btn2.addEventListener('click', function() {
    btn2.classList.add('on');
    setTimeout(function() {
        createNotif();
    }, 200);
    setTimeout(function() {
        btn2.classList.remove('on');
    }, 400);
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
    }, 100);
});
close3.addEventListener('click', function() {
    setTimeout(function() {
        popup_container.classList.remove('active');
    }, 100);
});


let btn_sample1 = document.querySelector('.btn_sample1');
btn_sample1.addEventListener('click', function() {
    btn_sample1.classList.add('on');
    setTimeout(function() {
        popup_container.classList.add('active');
        btn_sample1.classList.remove('on');
    }, 300);
});


let btn_sample2 = document.querySelector('.btn_sample2');
btn_sample2.addEventListener('click', function() {
    btn_sample2.classList.add('on');
    setTimeout(function() {
        popup_container.classList.add('active');
        btn_sample2.classList.remove('on');
    }, 250);
});
