'use strict';

class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.player; // 플레이어를 만들기 위한 동적 몸체 구성 선언.
        this.cursor; // 키보드 이벤트를 받기 위한 구성 선언.
        this.touch; // 터치 이벤트를 받기 위한 구성 선언.
        this.left = false;
        this.right = false;
        this.gameOver;
    }
    preload() {
        // 각 이미지 별 변수로 선언
        this.load.image('sky', 'static/images/star/sky.png'); // 800x600
        this.load.image('bomb', 'static/images/star/bomb.png'); // 14x14
        this.load.image('bombs', 'static/images/star/bombs.png'); // 14x14
        this.load.image('star', 'static/images/star/star.png'); // 24x22
        // 🚴‍♀️🏃‍♀️💎❤❤🧡💛💛💚💙💜💜🤎🖤
        // this.load.text('dia', '💎');
        this.load.image('ground', 'static/images/star/platform.png'); // 400x32
        this.load.spritesheet('dude', 'static/images/star/dude.png',
            { frameWidth: 32, frameHeight: 48 }
        ); // 288x48 의 스프라이트 이미지. 가로로 9개의 이미지 32x48 로 자르기
    }
    create() {
        let platform; // 배경을 만들기 위한 정적 몸체 구성 선언.
        let star;
        let bomb;
        let score = 0; // 점수
        let scoreText; // 점수가 표시
        this.add.image(400, 300, 'sky');
        // 이미지를 놓는 좌표. 이미지의 중심을 기준으로 설정해야 됨. 이미지 사이즈 : 800x600 >> 중심 : 400x300
        // this.add.image(400, 300, 'star'); // star 이미지를 놓는 좌표. 정가운데. 아래에 배치하면 레이어 위에 노출
        // 이미지 배치를 화면 밖에 했다고 문제가 있는 것이 아니고, off screen 만 되어 있을 뿐 정상적으로 배치가 된 상태.
        this.gameOver = false;
        this.physics.world.gravity.y = 100; // 중력 적용

        platform = this.physics.add.staticGroup();
        // arcade physics 에는 동적 몸체와 정적 몸체 두가지를 가질수 있다.
        // 동적 몸체 : 속도, 가속도와 같은 힘을 통해 움직일 수 있는 몸체이다. 다른 물체에 튕기거나 충돌 할 수 있으며 그 충돌은 몸체 및 기타 요소의 질량에 의해 영향을 받는다.
        // 정적 몸체(static) : 단순히 위치와 크기만 있다. 중력에 영향을받지 않고 속도를 설정할 수 없으며 무언가 충돌 할 때 움직이지 않는다. 플레이어가 뛰어 다닐 수 있는 지면과 플랫폼에 적합하다.

        // staticGroup() : 정적 몸체를 그룹화 하여 하나의 유닛으로 관리가 가능하다.

        platform.create(400, 568, 'ground').setScale(2).refreshBody();
        // ground의 사이즈는 400x32 인데, 2배로 확대 800x64 setScale(2); 이를 물리적 세계에 통보 refreshBody();
        // platform.create(600, 400, 'ground'); // 원 이미지를 그대로 사용하기 때문에 그대로 사용
        // platform.create(50, 250, 'ground');
        // platform.create(750, 220, 'ground');

        // 플레이어는 config에서 설정한 800x600의 세상을 벗어날 수 없다.
        this.player = this.physics.add.sprite(100, 450, 'dude');
        // this.player.lineStyle(2, 0xffff00, 1);
        // 스프라이트 처리된 dude 이미지가 처음 나타나는 위치 100, 450
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
            frameRate: 10,
        });
        this.physics.add.collider(this.player, platform);
        // 정적 그룹을 플레이어가 인식하도록 설정
        this.cursor = this.input.keyboard.createCursorKeys();
        this.touch = this.input.activePointer;
        this.add.text(20, 548, '👈', { fill: '#ff0000', fontSize: '50px' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function() {
            this.setStyle({ fill: '#0000ff' });
        })
        .on('pointerup', function() {
            this.setStyle({ fill: '#ff0000' });
        });

        this.add.text(320, 548, '👉', { fill: '#ff0000', fontSize: '50px' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function() {
            this.setStyle({ fill: '#0000ff' });
        })
        .on('pointerup', function() {
            this.setStyle({ fill: '#ff0000' });
        });


        this.time.addEvent({ // 별 타이머 적용
            callback: createStar,
            callbackScope: this,
            delay: 500,
            loop: true,
        });

        this.time.addEvent({ // 폭탄 타이머 적용
            callback: createBomb,
            callbackScope: this,
            delay: 200,
            loop: true,
        });

        scoreText = this.add.text(16, 16, 'Score : ' + score, {
            fontSize: '32px',
            fill: '#000',
        });

        function createStar() {
            if(this.gameOver) return ;
            star = this.physics.add.image(Phaser.Math.FloatBetween (10, 390), 0, 'star');
            star.setScale(1.5).refreshBody();
            this.physics.add.collider(star, platform, bottomStar, null, this);
            this.physics.add.overlap(this.player, star, hitStar, null, this);
        }

        function createBomb() {
            if(this.gameOver) return ;
            bomb = this.physics.add.image(Phaser.Math.FloatBetween (10, 390), 0, 'bomb');
            bomb.setScale(1.2).refreshBody();
            this.physics.add.collider(bomb, platform, bottomBomb, null, this);
            this.physics.add.overlap(this.player, bomb, hitBomb, null, this);
        }

        function bottomStar(star, platform) {
            star.destroy();
        }

        function bottomBomb(bomb, platform) {
            let des = this.physics.add.image(bomb.x-16, bomb.y-20, 'bombs').setScale(0.4).refreshBody();
            bomb.destroy();
            this.time.addEvent({ // 폭탄 타이머 적용
                callback: function() {
                    des.destroy();
                },
                callbackScope: this,
                delay: 100,
                loop: false,
            });
            score += 10;
            scoreText.setText('Score : ' + score);
        }

        function hitStar(player, star) {
            star.destroy();
            score += 50;
            scoreText.setText('Score : ' + score);
        }

        function hitBomb(player, star) {
            this.gameOver = true;
            this.physics.pause();
            player.anims.play('turn');
            player.setTint(0xff0000);
            scoreText = this.add.text(80, 250, 'Game Over', {
                fontSize: '50px',
                color: '#fff',
                // fill: '#000',
                backgroundColor: '#0000ff',
            });
            this.time.addEvent({ // 종료 타이머 적용
                callback: function() {
                    this.scene.start('Gameover');
                },
                callbackScope: this,
                delay: 2000,
                loop: false,
            });
        }

        

        // button.onInputOver.add(over, this);
        // button.onInputOut.add(out, this);
        // button.onInputUp.add(up, this);

        // function up() {
        //     console.log('button up', arguments);
        // }

        // function over() {
        //     console.log('button over');
        // }

        // function out() {
        //     console.log('button out');
        // }
        // function actionOnClick() {
        //     console.log('click');
        // }
    }
    // loop!!!
    update() {
        if(this.gameOver) return ;
        function _left(player) {
            player.setVelocityX(-160); // 왼쪽으로
            player.anims.play('left', true);
        }
        function _right(player) {
            player.setVelocityX(160); // 오른쪽으로
            player.anims.play('right', true);
        }
        function _center(player) {
            player.setVelocityX(0);
            player.anims.play('turn');
        }
        if(this.touch.isDown) {
            if(this.touch.downY > 530 && this.touch.downY < 600) {
                if(this.touch.downX > 0 && this.touch.downX < 100) {
                    _left(this.player);
                } else if(this.touch.downX > 300 && this.touch.downX < 400) {
                    _right(this.player);
                }
            }
        } else {
            // left < stop > right
            if(this.cursor.left.isDown) {
                _left(this.player);
            } else if(this.cursor.right.isDown) {
                _right(this.player);
            } else {
                _center(this.player);
            }
        }
    }
}
