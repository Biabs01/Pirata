const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Constraint = Matter.Constraint;

var engine, world;
var ground;
var backgroundImg;
var tower, towerImg;

var isGameOver = false;
var isLaughing = false;

var cannon, angle;

var cannonBall;
var balls = [];

var boat;
var boats = [];

var boatAnimation = [];
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

var backgroundSound, waterSound, cannonSound, pirateSound;

var score = 0;

function preload() {
  backgroundImg = loadImage("assets/background.gif");
  towerImg = loadImage("assets/tower.png");

  boatSpritedata = loadJSON("assets/boat/boat.json");
  boatSpritesheet = loadImage("assets/boat/boat.png");

  brokenBoatSpritedata = loadJSON("assets/boat/brokenBoat.json");
  brokenBoatSpritesheet = loadImage("assets/boat/brokenBoat.png");

  waterSplashSpritedata = loadJSON("assets/waterSplash/waterSplash.json");
  waterSplashSpritesheet = loadImage("assets/waterSplash/waterSplash.png");

  backgroundSound = loadSound("assets/background_music.mp3");
  waterSound = loadSound("assets/cannon_water.mp3");
  cannonSound = loadSound("assets/cannon_explosion.mp3");
  pirateSound = loadSound("assets/pirate_laugh.mp3");
}
function setup() {
  canvas = createCanvas(1200, 600);
  engine = Engine.create();
  world = engine.world;

  angleMode(DEGREES);
  angle = 20;

  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }
  
  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }

  options= {
    isStatic:true
  }
 
  ground = Bodies.rectangle(0, height-1, width*2, 1, options);
  World.add(world, ground);

  tower = Bodies.rectangle(160, 350, 160, 310, options);
  World.add(world, tower);

  cannon = new Cannon(180, 110, 130, 100, angle);
}

function draw() {
  background(189);
  image(backgroundImg, 0, 0, 1200, 600);
  rect(ground.position.x, ground.position.y, width*2, 1);

  fill("#6d4c41");
  textSize(40);
  text(`Pontuação: ${score}`, width - 200, 50);
  textAlign(CENTER, CENTER);

  if (!backgroundSound.isPlaying()){
    backgroundSound.play();
    backgroundSound.setVolume(0.1);
  }

  push();
  imageMode(CENTER);
  image(towerImg, tower.position.x, tower.position.y, 160, 310);
  pop();

  cannon.display();
  
  showBoats();

  for (var i = 0; i < balls.length; i++ ){
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  Engine.update(engine); 
}

function keyReleased() {
  if (keyCode === 32){
    cannonSound.play();
    balls[balls.length - 1].shoot();
  }
}

function keyPressed() {
  if (keyCode === 32){
    cannonBall = new CannonBall(cannon.x, cannon.y);
    cannonBall.trajectory = [];
    Body.setAngle(cannonBall.body, cannon.angle);
    balls.push(cannonBall);
  }
}

function showCannonBalls(ball, index) {
  if (ball) {
    ball.display();
    if(ball.body.position.y >= height - 50 && !ball.isSink){
      waterSound.play();
      ball.remove(index);
    }
    if(ball.body.position.x >= width && !ball.isSink){
      ball.remove(index);
    }
  }
}

function showBoats(){
  if (boats.length > 0){
    if (boats[boats.length - 1] === undefined ||
        boats[boats.length - 1].body.position.x < width - 300){
      var positions = [-20, -40, -60, -70];
      var position = random(positions);
      var boat = new Boat(width, height - 100, 170, 170, position, boatAnimation);
      boats.push(boat);
    }
    for (var i = 0; i < boats.length; i++){
      if(boats[i]){
        Body.setVelocity(boats[i].body, {x: -0.9, y:0});
        boats[i].display();
        boats[i].animate();

        var collision = Matter.SAT.collides(tower, boats[i].body);
        if(collision.collided && !boats[i].isBroken){
          if(!isLaughing && !pirateSound.isPlaying()){
            pirateSound.play();
            isLaughing = true;
          }
          isGameOver = true;
          gameOver();
        }
      }
    }
  } else {
    boat = new Boat(width-80, height - 60, 170, 170, -80, boatAnimation);
    boats.push(boat);
  }
}

function collisionWithBoat(index) {
  for (var i=0; i < boats.length; i++){
    if (balls[index] !== undefined && boats[i] !== undefined){
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);
      if (collision.collided) {
        if(!boats[i].isBroken && !balls[index].isSink){
          score += 5;
          boats[i].remove(i);
          World.remove(world, balls[index].body);
        }
        delete balls[index];
      }
    }
  }
}

function gameOver(){
  swal({
    title: "Fim de Jogo!",
    text: "Obrigada por jogar!",
    imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize: "150x150",
    confirmButtonText: "Jogar Novamente"
  },
  function(isConfirm){
    if(isConfirm){
      location.reload();
    }
  }
  );
}