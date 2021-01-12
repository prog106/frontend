/*
{
    function a() { // 선언
        // 실행
    }
    
    a(); // 호출
}

// 함수는 선언, 호출, 실행 의 순서로 진행

// hoist
{
    a(); // 호출
    function a() { // 선언
        console.log('aa'); // 실행
    }

    // let a = function() {
    //     console.log('aa');
    // }
}

{
    let x = 0;
    function a() {
        console.log(x * 2);
    }
    a(); // 0

    x = 1;
    a(); // 2
}

{
    function a(x=10) {
        console.log(x * 2);
    }
    a(0); // 0
    a(1); // 2
    a(); // 20
}

{
    let x = 1;
    function a() {
        console.log(x); // 1
        x = x * 3;
        console.log(x); // 3
        x++;
        console.log(x); // 4
    }
    a();
    console.log(x); // 4
}

{
    function a() {
        let x = 2;
        console.log(x); // 2
        x = x * 5;
        console.log(x); // 10
        return x;
    }
    let y = a();
    console.log(y); // 10
}

{
    const x = 1;
    function a() {
        console.log(x); // 1
        let y = x * 3;
        // x = x * 3;
        console.log(y); // 3
        y++;
        // x++; // x = x + 1;
        console.log(y); // 4
        return y;
    }
    let z = a();
    console.log(z); // 4
}

console.log('=============');
{
    function a() {
        let x = 2;
        let y = 3;
        return x * y;
    }
    let z1 = a();
    console.log(z1); // 6

    function b() {
        let x = 3;
        let y = 4;
        return x * y;
    }
    let z2 = b();
    console.log(z2); // 12
}

{
    function mul(x, y) {
        return x * y;
    }

    let z3 = mul(2, 3);
    console.log(z3); // 6

    let z4 = mul(3, 4);
    console.log(z4); // 12
}

{
    // jquery
    // $('#btn').click(function() {
        // alert(1);
    // });
    // javascript
    // document.querySelector('#btn').addEventListener('click', function() {
        // alert(1);
    // });
    // jquery
    // function a() {
        // alert(2);
    // }
    // $('#btn').click(a);
}

{
    function a(x) {
        x();
    }
    a(function() {
        console.log('aaaaa');
    });
}

{
    let a = 1;
    console.log(a);
}

console.log(a);

{
    let num = 4,
        kind;
    kind = (num) ? (num > 0 ? 'yang' : 'eum' ) : 'zero';

    if(num) {
        if(num > 0) {
            kind = 'yang';
        } else {
            kind = 'eum';
        }
    } else {
        kind = 'zero';
    }

    if (num == 0) {
        console.log('switch0');
    } else if (num == 1) {
        console.log('switch1');
    } else if (num == 2) {
        console.log('switch2');
    } else if (num == 3) {
        console.log('switch3');
    } else if (num == 4 || num == 5) {
        console.log('switch4');
    } else {
        console.log('if');
    }

    switch(num) {
    case 1:
        console.log('switch1');
        break;
    case 2:
        console.log('switch2');
        break;
    case 3:
        console.log('switch3');
        break;
    case 4:
    case 5:
        console.log('switch4');
        break;
    default:
        console.log('switch');
        break;
    }

    console.log(kind);
}

{
    let l = [null, false, true, 0, 1, 2, 3, 4, 5];

    console.log(l.length);
    console.log(l[0]);

    for(i=0;i<l.length;i++) {
        console.log(l[i]);
    }

    // 구구단
    let x, y;
    for(x=1; x<=9; x++) {
        for(y=1; y<=9; y++) {
            // console.log(x + 'x' + y + '=' + (x * y));
            // console.log(`${x} x ${y} = ${x * y}`);
        }
    }
}

{
    function gugudan(x) {
        let z = '<ul>'; // string
        for (let y=1; y<=9; y++) {
            // z += `<li>${x} x ${y} = ${x*y}</li>`;
            z = z + `<li>${x} x ${y} = ${x*y}</li>`;
        }
        z += '</ul>';
        document.querySelector('#list').innerHTML = z;

        let d = [{a:1}, {a:2}, {a:3}];
        // forEach
        d.forEach(function(k, v) {
            console.log(k);
        });
        // for ... in
        for(k in d) {
            console.log(d[k]);
        }
    }
    gugudan(3);
}

{
    let x = 'a'; // string
    let y = 1; // number

    x = x + 2; // a2 => x += 2;
    y = y + 1; // 2 => y += 1;

    console.log(x, y);
}

{
    function gugudan(x) {
        let z = '';
        for (let y=1; y<=9; y++) {
            z += `${x} x ${y} = ${x*y}\n`;
        }
        return z;
    }
    let z = gugudan(9);
    console.log (z);
}

{
    // 재귀함수 5! = 5*4*3*2*1 = 120
    function a(x) {
        return (x > 1) ? x * a(x-1) : 1;
    }
    console.log(a(5)); // 120
    console.log(a(10)); // 3628800
}

{
    // 데이터 형식 : json, xml
    // xml
    `<shop>
        <clothes>
            <dress>
                <size>small</size>
                <color>red</color>
            </dress>
            <dress>
                <size>medium</size>
                <color>blue</color>
            </dress>
            <dress>
                <size>large</size>
                <color>pink</color>
            </dress>
        </clothes>
    </shop>`
    // json
    let j = {
        'shop': {
            'clothes': {
                'dress': [
                    {'size': 'small', 'color': 'red'},
                    {'size': 'medium', 'color': 'blue'},
                    {'size': 'large', 'color': 'pink'}
                ]
            },
            'shoes': [
                {'size': 260},
                {'size': 250}
            ]
        }
    };
    console.log(j);
}
*/

{
    let dress = [
        {'size': 'small', 'color': 'red'},
        {'size': 'medium', 'color': 'blue'},
        {'size': 'large', 'color': 'pink'}
    ];
    console.log(dress);
    let ol = ''; // '<ol>';
    dress.forEach(function (v, k) {
        ol += `<li>사이즈 : ${v.size}, 색상 : ${v.color}</li>`;
    });
    // ol += '</ol>';
    // console.log(ol);
    // document.querySelector('#list').innerHTML = ol;
    document.querySelector('#list').insertAdjacentHTML('beforeend', ol);
}