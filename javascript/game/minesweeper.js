'use strict';

function Minesweeper() {
    // 지뢰 : 'X', 미오픈 : '', 오픈 : 0 ~ 8 - '' => 0 ~ 8\
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
        8: 'gray',
    }
    let mi = {
        0: 'ready',
        1: 'open',
        8: 'question',
        9: 'mine',
    }
    let timer = 0; // 타이머
    let setTimer = 0; // 타이머 셋팅
    let hor = 0; // 가로
    let ver = 0; // 세로
    let mine = 0; // 지뢰
    let mines = [];
    let mine_pos = [];
    exec();
    function exec() {
        clearInterval(setTimer);
        timer = 0;
        document.querySelector('#result').textContent = '';
        data = [];
        _data = [];
        end = false;
        suc = 0;
        hor = parseInt(document.querySelector('#hor').value);
        ver = parseInt(document.querySelector('#ver').value);
        mine = parseInt(document.querySelector('#mine').value);
        target = mine;
        mines = Array(hor * ver).fill().map(function(v, k) { return k; });
        mine_pos = [];
        while(mine_pos.length < mine) {
            mine_pos.push(mines.splice(Math.floor(Math.random() * mines.length), 1)[0]);
        }
        for(let i=0; i<ver; i++) {
            let hor_arr = [];
            let _hor_arr = [];
            for(let j=0; j<hor; j++) {
                if(mine_pos.indexOf((i*hor + j)) >= 0) {
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
            let _hor = parseInt(v%hor);
            let _ver = parseInt(v/hor);
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
        fulldraw();
        remain();
    }
    function save() {
        if(suc === ((hor * ver) - mine)) {
            end = true;
            data.forEach(function(v, k) {
                v.forEach(function(vv, kk) {
                    if(vv === 'X') {
                        document.querySelector('#p_'+k+'_'+kk).classList.add('mine');
                    }
                });
            });
            smile.className = '';
            smile.classList.add('success');
            clearInterval(setTimer);
            timer = 0;
            target = 0;
        }
    }
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
                if(_p !== 1 && _p !== 9 && _p !== 8) {
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
    function settimer() {
        let settimer = '';
        let ts = timer.toString();
        if(ts.length < 3) {
            ts = Array(3 - ts.length).fill().map(function(v, k) { return 0; }).join('') + ts;
        }
        for(let i=0; i<3; i++) {
            settimer += '<span class="t' + ((ts[i] !== undefined) ? ts[i] : '0') + '"></span>';
        }
        document.querySelector('#timer').innerHTML = settimer;
    }
    function starttimer() {
        if(timer === 0) {
            timer = 1;
            settimer();
            setTimer = setInterval(() => {
                timer++;
                settimer();
            }, 1000);
        }
    }
    function remain() {
        save();
        let setmine = '';
        let ts = ((target < 0) ? (target * -1) : target).toString();
        if(ts.length < 3) {
            ts = Array(3 - ts.length).fill().map(function(v, k) { return 0; }).join('') + ts;
        }
        if(target < 0) ts = '-' + ts.substring(1);
        for(let i=0; i<3; i++) {
            setmine += '<span class="t' + ((ts[i] !== undefined) ? ts[i] : '0') + '"></span>';
        }
        document.querySelector('#remain').innerHTML = setmine;
    }
    function actions() {
        let smile = document.querySelector('#smile');
        smile.addEventListener('mousedown', function() {
            smile.className = '';
            smile.classList.add('press');
        });
        smile.addEventListener('mouseup', function() {
            smile.className = '';
            smile.classList.add('ready');
        });
        smile.addEventListener('mouseout', function() {
            if(smile.classList.contains('press')) {
                smile.className = '';
                smile.classList.add('ready');
            }
        });
        smile.addEventListener('click', function() {
            hor = parseInt(document.querySelector('#hor').value);
            ver = parseInt(document.querySelector('#ver').value);
            mine = parseInt(document.querySelector('#mine').value);
            if(hor < 10 || ver < 10) {
                document.querySelector('#result').textContent = `10 X 10 이상 만들어 주세요.`;
                return ;
            }
            if(hor > 50 || ver > 50) {
                document.querySelector('#result').textContent = `50 X 50 이하로 만들어 주세요.`;
                return ;
            }
            if(hor * ver < mine) {
                document.querySelector('#result').textContent = `지뢰수가 너무 많습니다.`;
                return ;
            }
            exec();
        });
        document.querySelectorAll('.game > li').forEach(function(item) {
            item.addEventListener('mousedown', function() {
                if(smile.classList.contains('smile')) {
                    smile.className = '';
                    smile.classList.add('oh');
                }
            });
            item.addEventListener('mouseup', function() {
                if(smile.classList.contains('smile')) {
                    smile.className = '';
                    smile.classList.add('ready');
                }
            });
            item.addEventListener('mouseout', function() {
                if(smile.classList.contains('oh')) {
                    smile.className = '';
                    smile.classList.add('ready');
                }
            });
            item.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                if(!item.id) return ;
                if(end) return ;
                starttimer();
                let _pos = e.target.id.split('_');
                let _hor = parseInt(_pos[2]);
                let _ver = parseInt(_pos[1]);
                let _p = _data[_ver][_hor];
                if(_p === 1) {
                    if(self.classList === undefined) return ;
                    else if(self.classList.contains('mine')) {
                        _data[_ver][_hor] = 8;
                        target++;
                        suc--;
                    } else if(self.classList.contains('question')) {
                        _data[_ver][_hor] = 0;
                        suc--;
                     } else return ;
                } else if(_p === 0) {
                    _data[_ver][_hor] = 9; // !
                    target--;
                } else if(_p === 9) {
                    _data[_ver][_hor] = 8; // ?
                    target++;
                } else if(_p === 8) {
                    _data[_ver][_hor] = 0;
                }
                document.querySelector('#p_'+_ver+'_'+_hor).className = '';
                document.querySelector('#p_'+_ver+'_'+_hor).classList.add(mi[_data[_ver][_hor]]);
                remain();
            });
            item.addEventListener('click', function(e) {
                e.preventDefault();
                if(!item.id) return ;
                if(end) return ;
                starttimer();
                let _pos = e.target.id.split('_');
                let _hor = parseInt(_pos[2]);
                let _ver = parseInt(_pos[1]);
                if(_data[_ver][_hor] > 0) return ;
                _data[_ver][_hor] = 1;
                let p = data[_ver][_hor];
                if(p === 'X') { // mine
                    end = true;
                    e.currentTarget.classList.add('bombdeath');
                    smile.className = '';
                    smile.classList.add('fail');
                    clearInterval(setTimer);
                    timer = 0;
                    // 모든 폭탄 보여주기
                    data.forEach(function(v, k) {
                        v.forEach(function(vv, kk) {
                            if(vv === 'X') {
                                if(!document.querySelector('#p_'+k+'_'+kk).classList.contains('mine')) {
                                    document.querySelector('#p_'+k+'_'+kk).classList.add('bomb');
                                }
                            } else {
                                if(document.querySelector('#p_'+k+'_'+kk).classList.contains('mine')) {
                                    document.querySelector('#p_'+k+'_'+kk).classList.remove('mine');
                                    document.querySelector('#p_'+k+'_'+kk).classList.add('bombfail');
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
                    document.querySelector('#p_'+_ver+'_'+_hor).className = '';
                    document.querySelector('#p_'+_ver+'_'+_hor).classList.add(fc[p]);
                    suc++;
                    remain();
                }
            });
        });
    }
    function fulldraw() {
        let contents = `<li class="top_longbar"></li>
            <li class="contents">
                <ul class="header">
                    <li id="remain">
                        <span class="t0"></span><span class="t0"></span><span class="t0"></span>
                    </li>
                    <li>
                        <span id="smile" class="ready"></span>
                    </li>
                    <li id="timer">
                        <span class="t0"></span><span class="t0"></span><span class="t0"></span>
                    </li>
                </ul>
            </li>
            <li class="top_longbar"></li>`;
        let top = '';
        let mid = '';
        let bot = '';
        top += '<li class="top_left"></li>';
        mid += '<li class="mid_left"></li>';
        bot += '<li class="bot_left"></li>';
        for(let j=0; j<hor; j++) { // 가로
            top += '<li class="hor_bar"></li>';
            mid += '<li class="hor_bar"></li>';
            bot += '<li class="hor_bar"></li>';
        }
        top += '<li class="top_right"></li>';
        mid += '<li class="mid_right"></li>';
        bot += '<li class="bot_right"></li>';
        let game = '';
        for(let i=0; i<ver; i++) { // 세로
            game += `<li class="ver_bar"></li>`;
            for(let j=0; j<hor; j++) { // 가로
                game += `<li class="ready" id="p_${i}_${j}"></li>`;
            }
            game += `<li class="ver_bar"></li>`;
        }
        let html = top + contents + mid + game + bot;
        document.querySelector('.game').innerHTML = html;
        document.querySelector('.game').style.width = (16*hor+20)+'px';
        document.querySelector('.game li.contents').style.width = 16*hor+'px';
        remain();
        settimer();
        actions();
    }
    function draw() {
        for(let i=0; i<ver; i++) { // 세로
            for(let j=0; j<hor; j++) { // 가로
                let _p = _data[i][j];
                let item = document.querySelector('#p_'+i+'_'+j);
                if(!item.classList.contains('ready')) continue;
                item.className = '';
                if(_p === 1) {
                    if(data[i][j] > 0) {
                        item.classList.add(fc[data[i][j]]);
                    } else {
                        item.classList.add(mi[_p]);
                    }
                } else {
                    item.classList.add(mi[_p]);
                }
            }
        }
        remain();
    }
}
