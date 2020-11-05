'use strict';

// Javascript is synchronous
// hoisting : var, function 등이 제일 위에서 자동 선언
console.log('1');
setTimeout(() => console.log('3'), 1000);
console.log('2');

// Synchronous callback
function printImme(print) {
    print();
}
printImme(() => console.log('hello'));

// Asynchronous callback
function printWithDelay(print, timeout) {
    setTimeout(print, timeout);
}
printWithDelay(() => console.log('async callback'), 2000);


// Callback Hell example
class UserStorage {
    loginUser(id, password, onSuccess, onError) {
        setTimeout(() => {
            if((id === 'a' && password === '1') || (id === 'b' && password === '2')) {
                onSuccess(id);
            } else {
                onError(new Error('not found'));
            }
        }, 2000)
    }
    getRoles(user, onSuccess, onError) {
        setTimeout(() => {
            if(user === 'a') {
                onSuccess({name: 'A', role: 'Admin'});
            } else {
                onError(new Error('no access'));
            }
        });
    }
}

// id/password > login > role > object
const userstorage = new UserStorage();
const id = prompt('your id');
const pwd = prompt('your password');
userstorage.loginUser(id, pwd, function(user) {
    userstorage.getRoles(user, function(role) {
        alert(`Hello ${role.name}, you have a ${role.role}`);
    }, function(error) {
        console.log(error);
    });
}, function(error) {
    console.log(error);
});