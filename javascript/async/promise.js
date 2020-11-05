'use strict';

// Promise
// 1. state : pending -> fulfilled or rejected
// 2. producer vs consumer 차이점

// 1. Producer - resolve(성공시), reject(에러시)
const promise = new Promise((resolve, reject) => {
    console.log('1');
    setTimeout(() => {
        resolve('a');
        // reject(new Error('not found'));
    }, 2000);
});

// 2. Consumer - then(resolve), catch(reject), finally
promise
    .then((value) => {
        console.log(value);
    })
    .catch((error) => {
        console.log(error);
    })
    .finally(() => {
        console.log('finally');
    });

// 3. Promise chaining
const fetchNumber = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000);
});

fetchNumber
    // .then(num => num * 3)
    .then(function(num) {
        return num * 3
    })
    .then(num => num * 2)
    .then(num => {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(num - 1), 1000);
        });
    })
    .then(num => console.log(num));

// 4. Error Handling
const getHen = function() {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve('Hen'), 1000);
    });
}
const getEgg = function(hen) {
    return new Promise((resolve, reject) => {
        // setTimeout(() => resolve(`${hen} => Egg`), 1000);
        setTimeout(() => reject(new Error('Error!! Egg')), 1000);
    });
}
const cook = function(egg) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(`${egg} => Fried`), 1000);
    });
}

getHen()
    // .then((hen) => getEgg(hen))
    .then(function(hen) { return getEgg(hen); })
    .catch((error) => 'Bread') // 바로 위의 then 에서 에러가 날 경우 여기에서 처리하면 됨. 에러처리 중요!!!
    .then((egg) => cook(egg))
    .then((meal) => console.log(meal))
    .catch((error) => console.log(error));