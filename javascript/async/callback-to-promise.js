'use strict';

// Callback Hell example
// class UserStorage {
//     loginUser(id, password, onSuccess, onError) {
//         setTimeout(() => {
//             if((id === 'a' && password === '1') || (id === 'b' && password === '2')) {
//                 onSuccess(id);
//             } else {
//                 onError(new Error('not found'));
//             }
//         }, 2000)
//     }
//     getRoles(user, onSuccess, onError) {
//         setTimeout(() => {
//             if(user === 'a') {
//                 onSuccess({name: 'A', role: 'Admin'});
//             } else {
//                 onError(new Error('no access'));
//             }
//         });
//     }
// }


class UserStorage {
    loginUser(id, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if((id === 'a' && password === '1') || (id === 'b' && password === '2')) resolve(id);
                else reject(new Error('not found'));
            }, 1000);
        });
    }
    getRoles(user) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if(user === 'a') resolve({name: 'A', role: 'Admin'});
                else reject(new Error('No access'));
            });
        });
    }
}


// id/password > login > role > object
// const userstorage = new UserStorage();
// const id = prompt('your id');
// const pwd = prompt('your password');
// userstorage.loginUser(id, pwd, function(user) {
//     userstorage.getRoles(user, function(role) {
//         alert(`Hello ${role.name}, you have a ${role.role}`);
//     }, function(error) {
//         console.log(error);
//     });
// }, function(error) {
//     console.log(error);
// });


// const userstorage = new UserStorage();
// const id = prompt('your id');
// const pwd = prompt('your password');
// userstorage.loginUser(id, pwd)
//     .then((user) => userstorage.getRoles(user))
//     .then((role) => alert(`Hello ${role.name}, you have a ${role.role}`))
//     .catch((error) => console.log(error));


class UserStorages {
    delay(ms) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, ms);
        });
    }
    async loginUser(id, password) {
        await this.delay(1000);
        return (((id === 'a' && password === '1') || (id === 'b' && password === '2'))? id : 'not found');
    }
    async getRoles(user) {
        await this.delay(1000);
        return ((user === 'a')? {name: 'A', role: 'Admin'} : 'No access');
    }
}

const userstorages = new UserStorages();
const ids = prompt('your id');
const pwds = prompt('your password');
userstorages.loginUser(ids, pwds)
    .then((user) => userstorages.getRoles(user))
    .then((role) => alert(`Hello ${role.name}, you have a ${role.role}`))
    .catch((error) => console.log(error));