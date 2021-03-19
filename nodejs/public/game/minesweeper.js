'use strict';

// 지뢰 : 9, 땅 : 0, 오픈 : 1
let tbody = document.querySelector('#table tbody');
let data = []; // 데이터
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

document.querySelector('#exec').addEventListener('click', function() {
    tbody.innerHTML = '';
    document.querySelector('#result').textContent = '';
    data = [];
    end = false;
    suc = 0;
    let hor = parseInt(document.querySelector('#hor').value);
    let ver = parseInt(document.querySelector('#ver').value);
    let mine = parseInt(document.querySelector('#mine').value);
    target = mine;
    document.querySelector('#result').textContent = `${target} 개 남았습니다`;

    let mines = Array(hor * ver).fill().map(function(v, k) { return k + 1; });
    let mine_pos = [];
    while(mine_pos.length < mine) {
        mine_pos.push(mines.splice(Math.floor(Math.random() * mines.length), 1)[0]);
    }
    document.querySelector('#table thead td').colSpan = hor;

    // let hor_arr = '';
    for(let i=0; i<ver; i++) {
        let tr = document.createElement('tr');
        let hor_arr = [];
        for(let j=1; j<=hor; j++) {
            let td = document.createElement('td');
            td.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if(end) return ;
                // hor, ver 값 확인
                // console.log(e.currentTarget); // 나
                // console.log(e.currentTarget.parentNode); // 나의 상위 Node 와 상위 Node 속 자식 HTML
                // console.log(e.currentTarget.parentNode.children);
                // console.log(e.currentTarget.parentNode.parentNode.children); // 나의 상위 Node 의 자식들 HTMLCollection
                let _td = e.currentTarget;
                let _tr = e.currentTarget.parentNode;
                let _hor = Array.prototype.indexOf.call(_tr.children, _td);
                let _ver = Array.prototype.indexOf.call(_tr.parentNode.children, _tr);
                if(_td.textContent === '') {
                    // data[_ver][_hor] = '!';
                    e.currentTarget.textContent = '!';
                    e.currentTarget.classList.add('mine');
                    target--;
                } else if(_td.textContent === '!') {
                    // data[_ver][_hor] = '?';
                    e.currentTarget.textContent = '?';
                    e.currentTarget.classList.remove('mine');
                    e.currentTarget.classList.add('question');
                    target++;
                } else if(_td.textContent === '?') {
                    // data[_ver][_hor] = '0';
                    e.currentTarget.classList.remove('question');
                    if(data[_ver][_hor] === 9) {
                        e.currentTarget.textContent = ''; // X
                    } else if(data[_ver][_hor] === 0) {
                        e.currentTarget.textContent = '';
                    }
                }
                document.querySelector('#result').textContent = `${target} 개 남았습니다`;

            });
            td.addEventListener('click', function(e) {
                // e.preventDefault();
                if(end) return ;
                let _td = e.currentTarget;
                if(_td.textContent === '?' || _td.textContent === '!') return ;
                let _tr = e.currentTarget.parentNode;
                let _hor = Array.prototype.indexOf.call(_tr.children, _td);
                let _ver = Array.prototype.indexOf.call(_tr.parentNode.children, _tr);
                _td.classList.add('open');
                if(data[_ver][_hor] === 9) {
                    end = true;
                    e.currentTarget.textContent = 'B';
                    e.currentTarget.classList.add('bomb');
                    document.querySelector('#result').textContent = '실패!';
                } else if(data[_ver][_hor] === 0) { // 주변 처리
                    data[_ver][_hor] = 1;
                    suc++;
                    if(suc === ((hor * ver) - mine)) {
                        end = true;
                        document.querySelector('#result').textContent = '성공!';
                        return ;
                    }
                    let around = [];
                    around.push(data[_ver][_hor-1]); // 좌
                    around.push(data[_ver][_hor+1]); // 우
                    if(data[_ver-1]) {
                        around.push(data[_ver-1][_hor-1]); // 위 좌
                        around.push(data[_ver-1][_hor]); // 위
                        around.push(data[_ver-1][_hor+1]); // 위 우
                    }
                    if(data[_ver+1]) {
                        around.push(data[_ver+1][_hor-1]); // 아래 좌
                        around.push(data[_ver+1][_hor]); // 아래
                        around.push(data[_ver+1][_hor+1]); // 아래 우
                    }
                    let mine_cnt = around.filter(function(v) { return v === 9; }).length;
                    e.currentTarget.textContent = mine_cnt || ''; // false, '', 0, null, undefined, NaN
                    e.currentTarget.classList.add(fc[mine_cnt]);
                    if(mine_cnt === 0) {
                        // 주변칸 오픈
                        let arounds = [];
                        arounds.push(tbody.children[_ver].children[_hor-1]);
                        arounds.push(tbody.children[_ver].children[_hor+1]);
                        if(tbody.children[_ver-1]) {
                            arounds.push(tbody.children[_ver-1].children[_hor-1]);
                            arounds.push(tbody.children[_ver-1].children[_hor]);
                            arounds.push(tbody.children[_ver-1].children[_hor+1]);
                        }
                        if(tbody.children[_ver+1]) {
                            arounds.push(tbody.children[_ver+1].children[_hor-1]);
                            arounds.push(tbody.children[_ver+1].children[_hor]);
                            arounds.push(tbody.children[_ver+1].children[_hor+1]);
                        }
                        arounds.filter(function(v) {
                            return !!v;
                        }).forEach(function(v) {
                            v.click();
                        });
                    }
                }
            });
            if(mine_pos.indexOf((i*10 + j)) >= 0) {
                td.textContent = ''; // X
                hor_arr.push(9);
            } else {
                hor_arr.push(0);
            }
            tr.appendChild(td);
        }
        data.push(hor_arr);
        tbody.appendChild(tr);
    }
});
