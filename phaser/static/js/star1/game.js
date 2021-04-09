'use strict';

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.player; // 플레이어를 만들기 위한 동적 몸체 구성 선언.
        this.cursor; // 키보드 이벤트를 받기 위한 구성 선언.
    }
    preload() {
        // 각 이미지 별 변수로 선언
        this.load.image('sky', 'static/images/star/sky.png'); // 800x600
        this.load.image('bomb', 'static/images/star/bomb.png'); // 14x14
        this.load.image('star', 'static/images/star/star.png'); // 24x22
        this.load.image('ground', 'static/images/star/platform.png'); // 400x32
        this.load.spritesheet('dude', 'static/images/star/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        ); // 288x48 의 스프라이트 이미지. 가로로 9개의 이미지 32x48 로 자르기
    }
    create() {
        let platform; // 배경을 만들기 위한 정적 몸체 구성 선언.
        let stars; // 별을 만들기 위한 동적 몸체 구성 선언.
        let bombs; // 폭탄을 만들기 위한 동적 몸체 구성 선언.
        let score = 0; // 점수
        let scoreText; // 점수가 표시
        this.add.image(400, 300, 'sky');
        // 이미지를 놓는 좌표. 이미지의 중심을 기준으로 설정해야 됨. 이미지 사이즈 : 800x600 >> 중심 : 400x300
        // this.add.image(400, 300, 'star'); // star 이미지를 놓는 좌표. 정가운데. 아래에 배치하면 레이어 위에 노출
        // 이미지 배치를 화면 밖에 했다고 문제가 있는 것이 아니고, off screen 만 되어 있을 뿐 정상적으로 배치가 된 상태.

        this.physics.world.gravity.y = 300; // 중력 적용

        platform = this.physics.add.staticGroup();
        // arcade physics 에는 동적 몸체와 정적 몸체 두가지를 가질수 있다.
        // 동적 몸체 : 속도, 가속도와 같은 힘을 통해 움직일 수 있는 몸체이다. 다른 물체에 튕기거나 충돌 할 수 있으며 그 충돌은 몸체 및 기타 요소의 질량에 의해 영향을 받는다.
        // 정적 몸체(static) : 단순히 위치와 크기만 있다. 중력에 영향을받지 않고 속도를 설정할 수 없으며 무언가 충돌 할 때 움직이지 않는다. 플레이어가 뛰어 다닐 수 있는 지면과 플랫폼에 적합하다.

        // staticGroup() : 정적 몸체를 그룹화 하여 하나의 유닛으로 관리가 가능하다.

        platform.create(400, 568, 'ground').setScale(2).refreshBody();
        // ground의 사이즈는 400x32 인데, 2배로 확대 800x64 setScale(2); 이를 물리적 세계에 통보 refreshBody();
        platform.create(600, 400, 'ground'); // 원 이미지를 그대로 사용하기 때문에 그대로 사용
        platform.create(50, 250, 'ground');
        platform.create(750, 220, 'ground');

        // 플레이어는 config에서 설정한 800x600의 세상을 벗어날 수 없다.
        this.player = this.physics.add.sprite(100, 450, 'dude');
        // 스프라이트 처리된 dude 이미지가 처음 나타나는 위치 100, 450
        this.player.setBounce(0.2);
        // 착지할 때 반동을 준다. 1: 100%반동, 0.2: 20%반동, 1.2: 120%반동 > 재미있는 모습을 볼 수 있다.
        this.player.setCollideWorldBounds(true);
        // config에서 설정한 800x600의 세상에 머물도록 설정한다.

        // 키별로 액션을 추가한다.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1,
        });
        // 스프라이트된 이미지 0~3번째 이미지를 10프레임/1초 으로 처리하며 frameRate: 10, 계속되지 않도록 한다. repeat: -1
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8}),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 }],
            frameRate: 20,
        });
        this.physics.add.collider(this.player, platform);
        // 정적 그룹을 플레이어가 인식하도록 설정
        this.cursor = this.input.keyboard.createCursorKeys();
        // console.log(cursor);
        // down, left, right, shift, space, up 이벤트 처리 가능

        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {
                x: 12,
                y: 0,
                stepX: 70,
            }
        }); // 별 이미지 생성. y좌표 0, x좌표 12 부터 70간격으로 12개 생성 (12:0, 82:0, 152:0 ...). 기본 1개 생성 + 11개 repeat: 11
        stars.children.iterate(function(item) {
            item.setBounceY(Phaser.Math.FloatBetween (0.2, 0.6));
            // 별이 땅에 떨어지고 0.2 ~ 0.6 중 랜덤으로 튀어 오르기 적용
        });
        this.physics.add.collider(stars, platform);

        this.physics.add.overlap(this.player, stars, collectStar, null, this);
        // 플레이어와 별이 겹치면 collectStar function 을 실행한다.
        scoreText = this.add.text(16, 16, 'Score : ' + score, {
            fontSize: '32px',
            fill: '#000',
        });

        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platform); 
        // this.physics.add.collider(player, bombs, hitBomb, null, this);
        this.physics.add.overlap(this.player, bombs, hitBomb, null, this);

        function collectStar(player, star) {
            star.disableBody(true, true);
            // 플레이어와 별이 만나면 별이 사라지도록 처리
            score += 10;
            scoreText.setText('Score : ' + score);
            if(stars.countActive(true) === 0) {
                stars.children.iterate(function(item) {
                    item.enableBody(true, item.x, 0, true, true);
                });
                let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
                let bomb = bombs.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.FloatBetween(-200, 200), 20);
            }
        }
        function hitBomb(player, bomb) {
            this.physics.pause();
            // player.setTint(0xff0000);
            player.anims.play('turn');
            this.scene.start('Gameover');
        }
    }
    // loop!!!
    update() {
        // left < stop > right
        if(this.cursor.left.isDown) {
            this.player.setVelocityX(-160); // 왼쪽으로
            this.player.anims.play('left', true);
        } else if(this.cursor.right.isDown) {
            this.player.setVelocityX(160); // 오른쪽으로
            this.player.anims.play('right', true);
        } else {
            // console.log(3);
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
        // up
        if(this.cursor.up.isDown) {
            if(this.player.body.touching.down) this.player.setVelocityY(-330); // 바닥에 닿았을 때 만 점프 가능
        }
    }
}
