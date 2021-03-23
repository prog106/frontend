'use strict';

const socket = io('http://localhost:3000/minesweeper'); // socket.io 접속
socket.on('success', function() {
    document.querySelector('#result').textContent = '성공!';
});

// 지뢰 : 'X', 미오픈 : '', 오픈 : 0 ~ 8 - '' => 0 ~ 8
let tbody = document.querySelector('#table tbody');
let data = []; // mine 데이터
let _data = []; // open 데이터 - 미오픈 : 0, 오픈 : 1, ? : 8, 깃발 : 9
let end = false; // 게임 종료 여부
let suc = 0; // 찾은 지뢰
let target = 0; // 남은 지뢰
let fc = { // 숫자색 class
    1: 'blue',
    2: 'green',
    3: 'red',
    4: 'darkblue',
    5: 'darkred',
    6: 'darkcyan',
    7: 'black',
}
let timer = 0; // 타이머
let setTimer = 0; // 타이머 셋팅
let hor = 0; // 가로
let ver = 0; // 세로
let mine = [];
let mines = [];
let mine_pos = [];

// 종료 확인
function save() {
    if(suc === ((hor * ver) - mine)) {
        end = true;
        clearInterval(setTimer);
        data.forEach(function(v, k) {
            v.forEach(function(vv, kk) {
                if(vv === 'X') {
                    tbody.children[k].children[kk].classList.add('mine');
                }
            });
        });
        socket.emit('success', { // success - 서버로 전송
            ver: ver,
            hor: hor,
            mine: mine,
            sec: timer,
        });
    }
}

// 클릭한 위치에 따라 0으로 연결된 곳은 모두 open ( _data : 1 )한 후 _data로 그림 다시그리기
function opener(_ver, _hor) {
    // 주변 확인
    function _opener(_ver, _hor) {
        let neighbor = [];
        neighbor.push({_ver: _ver, _hor: _hor-1});
        neighbor.push({_ver: _ver, _hor: _hor+1});
        if(data[_ver-1]) {
            neighbor.push({_ver: _ver-1, _hor: _hor-1});
            neighbor.push({_ver: _ver-1, _hor: _hor});
            neighbor.push({_ver: _ver-1, _hor: _hor+1});
        }
        if(data[_ver+1]) {
            neighbor.push({_ver: _ver+1, _hor: _hor-1});
            neighbor.push({_ver: _ver+1, _hor: _hor});
            neighbor.push({_ver: _ver+1, _hor: _hor+1});
        }
        neighbor.filter(function(v) {
            return data[v._ver][v._hor] !== undefined;
        }).forEach(function(v) {
            let p = data[v._ver][v._hor];
            let _p = _data[v._ver][v._hor];
            if(_p !== 1) {
                if(p === 0) {
                    _data[v._ver][v._hor] = 1;
                    suc++;
                    _opener(v._ver, v._hor);
                } else if(p !== 'X') {
                    _data[v._ver][v._hor] = 1;
                    suc++;
                }
            }
        });
    }
    _opener(_ver, _hor);
    draw();
}

function draw() {
    tbody.innerHTML = '';
    for(let i=0; i<ver; i++) {
        let tr = document.createElement('tr');
        for(let j=0; j<hor; j++) {
            let td = document.createElement('td');
            let _p = _data[i][j];
            if(_p === 1) {
                td.classList.add('open');
                if(data[i][j] > 0) td.classList.add(fc[data[i][j]]);
            } else if(_p === 8) {
                td.classList.add('question');
            } else if(_p === 9) {
                td.classList.add('mine');
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    save();

    document.querySelectorAll('tbody td').forEach(function(v) {
        v.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            if(end) return ;
            let _td = e.currentTarget;
            let _tr = e.currentTarget.parentNode;
            let _hor = Array.prototype.indexOf.call(_tr.children, _td);
            let _ver = Array.prototype.indexOf.call(_tr.parentNode.children, _tr);
            let _p = _data[_ver][_hor];
            if(_p === 1) return ;
            else if(_p === 0) {
                _data[_ver][_hor] = 9; // !
                target--;
            } else if(_p === 9) {
                _data[_ver][_hor] = 8; // ?
                target++;
            } else if(_p === 8) {
                _data[_ver][_hor] = 0;
            }
            draw();
            document.querySelector('#result').textContent = `${target} 개 남았습니다.`;
        });
        v.addEventListener('click', function(e) {
            e.preventDefault();
            if(end) return ;
            let _td = e.currentTarget;
            let _tr = e.currentTarget.parentNode;
            let _hor = Array.prototype.indexOf.call(_tr.children, _td);
            let _ver = Array.prototype.indexOf.call(_tr.parentNode.children, _tr);
            if(_data[_ver][_hor] > 0) return ;
            _data[_ver][_hor] = 1;
            let p = data[_ver][_hor];
            if(p === 'X') { // mine
                end = true;
                e.currentTarget.classList.add('bombdeath');
                document.querySelector('#result').textContent = '실패!';
                clearInterval(setTimer);
                // 모든 폭탄 보여주기
                data.forEach(function(v, k) {
                    v.forEach(function(vv, kk) {
                        if(vv === 'X') {
                            if(!tbody.children[k].children[kk].classList.contains('mine')) {
                                tbody.children[k].children[kk].classList.add('bomb');
                            }
                        } else {
                            if(tbody.children[k].children[kk].classList.contains('mine')) {
                                tbody.children[k].children[kk].classList.remove('mine');
                                tbody.children[k].children[kk].classList.add('bombfail');
                            }
                        }
                    });
                });
            } else if(p === 0) { // open
                _data[_ver][_hor] = 1;
                suc++;
                opener(_ver, _hor);
            } else { // number
                _data[_ver][_hor] = 1;
                suc++;
                draw();
                save();
            }
        });
    });
}

document.querySelector('#exec').addEventListener('click', function() {
    timer = 0;
    document.querySelector('table').style.display = 'inline-block';
    document.querySelector('#result').textContent = '';
    document.querySelector('#timer').textContent = timer;
    clearInterval(setTimer);
    setTimer = setInterval(() => {
        timer++
        document.querySelector('#timer').textContent = timer;
    }, 1000);
    data = [];
    _data = [];
    end = false;
    suc = 0;
    hor = parseInt(document.querySelector('#hor').value);
    ver = parseInt(document.querySelector('#ver').value);
    mine = parseInt(document.querySelector('#mine').value);
    target = mine;
    document.querySelector('#result').textContent = `${target} 개 남았습니다.`;
    mines = Array(hor * ver).fill().map(function(v, k) { return k; });
    mine_pos = [];
    while(mine_pos.length < mine) {
        mine_pos.push(mines.splice(Math.floor(Math.random() * mines.length), 1)[0]);
    }
    for(let i=0; i<ver; i++) {
        let hor_arr = [];
        let _hor_arr = [];
        for(let j=0; j<hor; j++) {
            if(mine_pos.indexOf((i*ver + j)) >= 0) {
                hor_arr.push('X');
            } else {
                hor_arr.push(0);
            }
            _hor_arr.push(0);
        }
        data.push(hor_arr);
        _data.push(_hor_arr);
    }
    mine_pos.forEach(function(v, k) {
        let _hor = parseInt(v%ver);
        let _ver = parseInt(v/ver);
        for(let i=-1; i<=1; i++) {
            for(let j=-1; j<=1; j++) {
                if(data[parseInt(_ver+i)]) {
                    if(data[parseInt(_ver+i)][parseInt(_hor+j)] !== undefined && data[parseInt(_ver+i)][parseInt(_hor+j)] !== 'X') {
                        data[parseInt(_ver+i)][parseInt(_hor+j)] += 1;
                    }
                }
            }
        }
    });
    document.querySelector('#table thead td').colSpan = hor;
    document.querySelector('#table').style.width = hor*16+'px';
    draw();
});
