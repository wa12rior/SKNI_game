import Phaser from "phaser";
import background from "./assets/background.png";
import ground from "./assets/floor.png";
import spider from "./assets/spider.png";
import dude from "./assets/dude.png";
import coin from "./assets/coin.png";

const config = {
  type: Phaser.AUTO,
  parent: "My Game",
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // #1 Preloading images
  this.load.image("background", background);
  this.load.image("ground", ground);
  this.load.image("spider", spider);
  this.load.spritesheet('coin', coin, { frameWidth: 16, frameHeight: 16 })
  this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 })
}

function generatePlatforms(count, x = 0, y, root, invert, scale) {
  // platform size
  var size = 16;
  
  if (invert) {
    // Config.width - x bcs we want to start from the middle
    for (let i = 0; i < count; i++) {
      root.create(config.width - x + (i * size), y, 'ground').setScale(scale).refreshBody();
    }
  }
  else {
    // generating loop
    for (let i = x; i < count; i++) {
      root.create(i * size, y, 'ground').setScale(scale).refreshBody();
    }
  }
}

function addCoins(context) {
  
  // #6 add coins
  for (let i = 0; i < Phaser.Math.RND.between(3,10); i++) {
    let x = Phaser.Math.RND.between(0, 800);
		let y = Phaser.Math.RND.between(0, 600);

		context.coins.create(x, y,'coin');
  }

  context.coins.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
    child.anims.play('coin');
  });
}

function create() {
  // # 2 creating platforms
  this.add.image(400,300,'background').setScale(2.5);

  let platforms = this.physics.add.staticGroup();
  // main platform
  generatePlatforms(50, 0, config.height - 16, platforms, 0, 2);

  // rest of platforms
  generatePlatforms(16, 0, 200, platforms, 0, 1);
  generatePlatforms(20, 150, 250, platforms, 1, 1);
  generatePlatforms(23, 0, 400, platforms, 0, 1);
  // generatePlatforms(20, 150, 250, platforms, 1, 1);
  generatePlatforms(4, 290, 300, platforms, 1, 1);

  // #3 player

  this.player = this.physics.add.sprite(100, 450, 'dude');
  this.player.setBounce(0.1);
  this.player.setCollideWorldBounds(true);

  // #4 animations of player

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'idle',
    frames: [ { key: 'dude', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'coin',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // #5 kolizja

  this.physics.add.collider(this.player, platforms);

  
  this.coins = this.physics.add.group();
  addCoins(this);

  // #7 collision coins with platforms

  this.physics.add.collider(this.coins, platforms);
  this.physics.add.overlap(this.player, this.coins, collectCoin, null, this);
  
  // #8 score text
  this.score = 0;
  this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#FFF', fontFamily: 'roboto'});
  
  // #9 enemies
  this.spiders = this.physics.add.group();
  this.physics.add.collider(this.spiders, platforms);
  this.physics.add.collider(this.player, this.spiders, hitSpider, null, this);
}

function hitSpider (player, spider) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('idle');
  gameOver = true;
}

function collectCoin(player, coin) {
  coin.disableBody(true, true);

  this.score += 10;
  this.scoreText.setText('Score: ' + this.score);

  if (this.coins.countActive(true) < 2)
  {
    addCoins(this);

    let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    let spider = this.spiders.create(x, 16, 'spider');
    spider.setBounce(1);
    spider.setCollideWorldBounds(true);
    spider.setVelocity(Phaser.Math.Between(-300, 300), 20);
  }
}

function update() {
  // #3 player movement
  let cursors = this.input.keyboard.createCursorKeys();

  if (cursors.left.isDown) {
    this.player.setVelocityX(-160);
    this.player.anims.play('left', true);
  }
  else if (cursors.right.isDown) {
    this.player.setVelocityX(160);
    this.player.anims.play('right', true);
  }
  else {
    this.player.setVelocityX(0);
    this.player.anims.play('idle');
  }

  if (cursors.up.isDown && this.player.body.touching.down) {
    this.player.setVelocityY(-330);
  }
}
