var mapDimX = 20;
var mapDimY = 40;

var TILE_WIDTH = 32;
var TILE_HEIGHT = 29;

var GAME_WINDOW_WIDTH = TILE_WIDTH * mapDimX;
var GAME_WINDOW_HEIGHT = 960;

var MAX_POWER_LEVEL = 1;
var CHECKPOINT_NUMBER = 3;
var TILES_IN_ONE_CHECKPOINT_AREA = parseInt(mapDimY/CHECKPOINT_NUMBER);

var game = new Phaser.Game(GAME_WINDOW_WIDTH, GAME_WINDOW_HEIGHT, Phaser.CANVAS, null, { preload: preload, create: create, update: update });

var myFont;

var player, object, powerLevel = 0, score = 0;
var currentCheckpointArea = 1;

var player, object, powerLevel = 0;

var map, mapLayer, droplets;

var music, musicCtrl;

function preload() {
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#037A88';

  game.load.image('background', 'img/background.png');
  game.load.image('ground', 'img/ground.png');
  game.load.image('player', 'img/brick.png');
  game.load.image('windows', 'img/windows.png');
  game.load.spritesheet('audio-control', 'img/button-sound.png', 180, 180)
  game.load.image('droplet', 'img/droplet.png');
  game.load.audio('level01', ['music/level01.mp3', 'music/level01.ogg']);
}

function create() {
  game.add.sprite(0, 0, 'background');
  game.add.sprite(0, 292, 'ground');

  game.physics.startSystem(Phaser.Physics.ARCADE);
  spawnPlayer();
  createPowerLevelText();
  createScoreText();
  droplets = game.add.group();
  createMap();
  game.camera.follow(player);
  game.time.events.loop(Phaser.Timer.SECOND, updateCounter, this);

  var buttonMusic = this.add.button(500, 20, 'audio-control', this.clickMusic, this, 1,0,2);
  buttonMusic.setFrames(1, 0, 2);
  buttonMusic.fixedToCamera = true;

  music = game.add.audio('level01');
  music.loopFull();
  music.play();
}

function clickMusic() {
  music.stop();
}

function updateCounter() {
  if(powerLevel < MAX_POWER_LEVEL){
    powerLevel++;
    powerLevelText.setText(powerLevel);
  }
}

function update() {
  game.physics.arcade.collide(player, mapLayer);

  game.physics.arcade.collide(player, droplets, function (player, droplet) {
    droplet.destroy();
      updateScore(1);
  });

  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
    player.body.velocity.x = -250;
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
    player.body.velocity.x = 250;
  } else {
    player.body.velocity.x = 0;
  }

  if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && player.body.onFloor() && powerLevel == MAX_POWER_LEVEL) {
    player.body.velocity.y = -450;
    powerLevel = 0;
    powerLevelText.setText(powerLevel);
  }

  if(checkpointIsCrossed()){
    updateScore(10);
  }

}

function checkpointIsCrossed(){
  var currentPlayerTileYPosition = mapDimY - mapLayer.getTileY(player.body.position.y);
  if(currentPlayerTileYPosition > TILES_IN_ONE_CHECKPOINT_AREA * currentCheckpointArea){
    currentCheckpointArea++;
    return true;
  }
  return false;
}

function updateScore(scores){
  score += scores;
  scoreText.setText("Score: " + score);
}

function spawnPlayer() {
  player = game.add.sprite(game.world.CenterX, TILE_HEIGHT*(mapDimY-1), 'player');
  player.anchor.set(0.5);
  game.physics.enable(player, Phaser.Physics.ARCADE);
  player.body.gravity.y = 600;
  player.body.collideWorldBounds = true;
}

function createPowerLevelText(){
  powerLevelText = game.add.text(20,20, powerLevel , {font: "48px Arial", fill: "#000"});
  powerLevelText.fixedToCamera = true;
}

function createMusicOnOff() {

}

function createScoreText(){
  scoreText = game.add.text(GAME_WINDOW_WIDTH-250,20, "Score: " + score , {font: "48px Arial", fill: "#000"});
  scoreText.fixedToCamera = true;
}

function createMap() {
  map = game.add.tilemap();
  map.addTilesetImage('windows', 'windows', TILE_WIDTH, TILE_HEIGHT);
  map.setCollision([0, 1, 2], true);

  mapLayer = map.create('level', mapDimX, mapDimY, TILE_WIDTH, TILE_HEIGHT);
  mapLayer.resizeWorld();

  var WINDOW = 0;
  var lastStart = 0;
  var lastEnd = 0;
  for (var i = 0; i < mapDimY - 2; i++) {
    var startPositionX;
    var leafLength = game.rnd.integerInRange(5, 7);
    do {
      startPositionX = game.rnd.integerInRange(0, mapDimX - 7);
    }
    while (!(startPositionX + 2 <= lastStart
      || startPositionX + leafLength - 2 >= lastEnd ))

    for (var j = 0; j < leafLength; j++) {
      map.putTile(WINDOW, startPositionX + j, i * 2, mapLayer);
    }

    if (game.rnd.integerInRange(0, 5) == 0) {
      // Generate a droplet.
      var posX = game.rnd.integerInRange(startPositionX, startPositionX + leafLength - 1);
      var posY = i*2 - 1;
      droplet = game.add.sprite(posX*TILE_WIDTH, posY*TILE_HEIGHT, 'droplet');
      game.physics.enable(droplet, Phaser.Physics.ARCADE);
      droplets.add(droplet);
    }

    lastStart = startPositionX;
    lastEnd = lastStart + leafLength;
  }

  // floor:
  for (var j = 0; j < mapDimX; j++) {
    map.putTile(WINDOW, j, mapDimY - 1, mapLayer);
  }
}
