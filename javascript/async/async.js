// async & await
// promise 를 사용할 수 있는 방법

// 1. async : 비동기식으로 처리되도록 선언. 즉 Promise 와 같이 동작하게 됨.
// function fetchuser() {
//     return new Promise((resolve, reject) => {
//         resolve('prog106');
//         // return 'prog106';
//     });
// }

async function fetchuser() {
    return 'prog106';
}

const user = fetchuser();
console.log(user);

user.then(console.log);

// 2. await
function delay(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

async function getApple() {
    await delay(1000);
    return 'apple';
}

async function getBanana() {
    await delay(1000);
    return 'banana';
}

// function pickFruit() {
//     return getApple().then(apple => {
//         return getBanana().then(banana => {
//             return `${apple} ${banana}`;
//         });
//     });
// }

async function pickFruit() {
    let apple = await getApple();
    let banana = await getBanana();
    return `${apple} ${banana}`;
}
pickFruit().then(console.log);

// 3. useful Promise APIs
function pickAllFruits() {
    return Promise.all([getApple(), getBanana()]).then(fruits => fruits.join(' + '));
}

pickAllFruits().then(console.log);

function pickOnlyOne() {
    return Promise.race([getApple(), getBanana()]);
}

pickOnlyOne().then(console.log);
