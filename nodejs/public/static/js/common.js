'use strict';

let ax_post = function(url, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.onload = function() {
        callback(JSON.parse(this.responseText));
    }
    xhr.send(data);
}
let ax_fetch = function(url, data, callback) {
    fetch(url, {
        method: 'POST',
        body: data,
    })
    .then(response => response.json())
    .then(response => callback(response))
    .catch(error => console.error);
}
