function Game2048() {
    let data = [];
    init();
    function init() {
        [1, 2, 3, 4].forEach(function(v, k) {
            let _data = [];
            let tr = document.createElement('tr');
            [1, 2, 3, 4].forEach(function(vv, kk) {
                _data.push(0);
                let td = document.createElement('td');
                tr.appendChild(td);
            });
            document.querySelector('#table').appendChild(tr);
            data.push(_data);
        });
        random();
        // random();
        // random();
    }
    function random() {
        let _data = [];
        data.forEach(function(v, k) {
            v.forEach(function(vv, kk) {
                if(vv < 1) _data.push([k, kk]);
            });
        });
        let _pos = _data[Math.floor(Math.random() * _data.length)] || 0;
        if(_pos) {
            data[_pos[0]][_pos[1]] = 2;
            draw();
        } else {
            console.log('end');
        }
    }
    function draw() {
        let _table = document.querySelector('#table');
        data.forEach(function(v, k) {
            v.forEach(function(vv, kk) {
                _table.children[k].children[kk].textContent = (vv > 0) ? vv : '';
            });
        });
    }
    function drag(_start, _end) {
        let x = _end[0] - _start[0];
        let y = _end[1] - _start[1];
        let f = y/x;
        let _direction;
        let _data;
        // y/x 값에 따라 기울기 값 계산
        if(x >= 0) {
            if(f <= 1 && f >= -1) _direction = 'ArrowRight';
            else if(f > 1) _direction = 'ArrowDown';
            else if(f < -1) _direction = 'ArrowUp';
        } else {
            if(f <= 1 && f >= -1) _direction = 'ArrowLeft';
            else if(f > 1) _direction = 'ArrowUp';
            else if(f < -1) _direction = 'ArrowDown';
        }
        direction(_direction);
    }

    function direction(_direction) {
        _data = [[], [], [], []];
        [1, 2, 3, 4].forEach(function(v, k) {
            [1, 2, 3, 4].forEach(function(vv, kk) {
                switch(_direction) {
                    case "ArrowUp":
                        if(data[k][kk]) _data[kk].push(data[k][kk]);
                    break;
                    case "ArrowDown":
                        if(data[3-k][kk]) _data[kk].push(data[3-k][kk]);
                    break;
                    case "ArrowLeft":
                        if(data[k][kk]) _data[k].push(data[k][kk]);
                    break;
                    case "ArrowRight":
                        if(data[k][3-kk]) _data[k].push(data[k][3-kk]);
                    break;
                }
            });
        });
        _data.forEach(function(v, k) {
            for(let i=1; i<v.length; i++) {
                if(v[i] === v[i-1]) {
                    _data[k][i-1] = v[i-1]*2;
                    _data[k].splice(i, 1);
                }
            }
        });
        [1, 2, 3, 4].forEach(function(v, k) {
            [1, 2, 3, 4].forEach(function(vv, kk) {
                switch(_direction) {
                    case "ArrowUp":
                        data[k][kk] = _data[kk][k] || 0;
                    break;
                    case "ArrowDown":
                        data[3-k][kk] = _data[kk][k] || 0;
                    break;
                    case "ArrowLeft":
                        data[k][kk] = _data[k][kk] || 0;
                    break;
                    case "ArrowRight":
                        data[k][3-kk] = _data[k][kk] || 0;
                    break;
                }
            });
        });
        draw();
        random();
    }
    let drag_start;
    let drag_end;
    window.addEventListener('mousedown', function(event) {
        drag_start = [event.clientX, event.clientY];
    });
    window.addEventListener('mousemove', function(event) {
    });
    window.addEventListener('mouseup', function(event) {
        drag_end = [event.clientX, event.clientY];
        drag(drag_start, drag_end);
    });
    window.addEventListener('keydown', function(e) {
        direction(e.code);
    });
}
