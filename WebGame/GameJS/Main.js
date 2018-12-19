import {generateGLConsole as GLConsole} from './Console/Console.js';
import {initShaderProgram as linker} from '../Shaders/ShaderLinker.js';
import {render as draw} from './Render.js';
import {updateBuffer, generateVBOs} from './Buffers.js';
import {VerticesArray, Vertices} from './VertecesHandler.js';
import {generateBoardVerteces, generateGreenRect, clearOverlayColor, generateRectVertRange, generateBoardPlayedArea, initBoard} from './Objects.js';
import {Board} from './Board.js';
import {Player} from './Player.js';
import {keystrokeHeld, keystrokeUp} from './KeyboardHandler.js';
import {generateCommands} from './Commands.js';

let board;
let glStuff;
let gl;
let glConsole;
let shaderId;
//var someSamplerLoc;
//let tex;
let positionLoc;
let uGlobalColor;
let x, y, xClicked = -1, yClicked = -1, quadrant = 0, inputFocusState = false, counterTextIndicator = 0;
let shiftDown = false, ctrl = false;
let VBO = new VerticesArray;
VBO.add(new Vertices("preColorTemp"));
VBO.add(new Vertices("board"));
VBO.add(new Vertices("Green"));
VBO.add(new Vertices("Red"));
VBO.add(new Vertices("lightColor"));
VBO.add(new Vertices("preColor"));
VBO.add(new Vertices("pointRectIndicator"));

let VAO = [];

window.requestAnimFrame = ( function() {
		   
  return  window.requestAnimationFrame || 
          window.webkitRequestAnimationFrame ||  
          window.mozRequestAnimationFrame || 
          window.oRequestAnimationFrame || 
          window.msRequestAnimationFrame ||
  
  // if none of the above exist, use non-native timeout method
  function(callback) {
    window.setTimeout(callback, 1000 / 60);
  };

} ) (); 

main();

function main() {
  init();

  animationLoop();
}


function init(){
  let xWindow = document.documentElement.clientWidth, yWindow = document.documentElement.clientHeight;
  
  // Set size of the game canvas
  const canvas = document.querySelector("#glCanvas");
  canvas.width = xWindow * 0.65;
  canvas.height = yWindow * 0.95;
  // Set the size of the console and input
  const con = document.querySelector("#glConsole");
  con.width = xWindow * 0.3;
  con.height = yWindow * 0.218;
  const input = document.querySelector("#glInput");
  input.width = xWindow * 0.3;
  input.height = yWindow * 0.05;


  glConsole = GLConsole();
  glConsole.clear();
  board = new Board("30", new Player("Green"), new Player("Red"), 30);

  // Initialize the GL context
  gl = canvas.getContext("webgl2");

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
  }
  // Init shaders
  shaderId = linker(gl);
  //initShaderProgram(gl);
  //Bind Shader
  gl.useProgram(shaderId);
  
  //someSamplerLoc = gl.getUniformLocation(shaderId, "u_texture");
  positionLoc = gl.getAttribLocation(shaderId, "position");
  uGlobalColor = gl.getUniformLocation(shaderId, "uGlobalColor");

  generateVBOs(gl, VAO, VBO, positionLoc);
  generateBoardVerteces(gl, VBO.findByName("board"), board.size);
  initBoard(gl, VBO.findByName("preColorTemp"), board);

  glStuff = {
    positionLoc: positionLoc,
    uGlobalColor: uGlobalColor,
    VAO: VAO
  }

  { // Setup board
    //board.resetBoard(gl, VBO, glConsole, turnTimer, turnTimerStamp, gameFinished);
  }
  { // Setup commands for the console
    glConsole.insertCommands(generateCommands(gl, VBO, glConsole, board));
  }
  
  window.addEventListener("resize", onResize);
  window.addEventListener("keyup", function(event) {
    if(event.keyCode == 16)
      shiftDown = false;
    if(event.keyCode == 17)
       ctrl = false;
    if(inputFocusState){
      keystrokeUp(event, shiftDown, ctrl);
    }
  });
  window.addEventListener("keydown", function(event) {
    if(event.keyCode == 55) event.preventDefault();
    if(event.keyCode == 16){
      shiftDown = true;
    }
    if(event.keyCode == 17)
       ctrl = true;
    if(inputFocusState){
      keystrokeHeld(event, shiftDown, ctrl);
    }
  });
  document.getElementById("glCanvas").addEventListener("mousemove", function(event) {
    onMouseMove(event);
  });
  document.getElementById("glCanvas").addEventListener("click", function(event) {
    if(inputFocusState == true){
      inputFocusState = false;
      glConsole.doTextIndicator(true);
    }
    mouseClick(event);
  });
  document.getElementById("glCanvas").addEventListener("contextmenu", function(event) {
    event.preventDefault();
    mouseClick(event);
  });
  document.getElementById("glInput").addEventListener("click", function() {
    if(inputFocusState == false){
      inputFocusState = true;
      glConsole.doTextIndicator(false);
    }
  });
}

function onResize(){
  let xWindow = document.documentElement.clientWidth, yWindow = document.documentElement.clientHeight;
  
  // Set size of the game canvas
  const canvas = document.querySelector("#glCanvas");
  canvas.width = xWindow * 0.65;
  canvas.height = yWindow * 0.95;
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set the size of the console and input
  const con = document.querySelector("#glConsole");
  con.width = xWindow * 0.3;
  con.height = yWindow * 0.218;
  const input = document.querySelector("#glInput");
  input.width = xWindow * 0.3;
  input.height = yWindow * 0.05;
  glConsole.updateConsole();
}

function onMouseMove(e){
  x = e.clientX - Math.round(document.documentElement.clientWidth*0.01);
  y = e.clientY - Math.round(document.documentElement.clientHeight*0.01);
  if(xClicked > -1 && yClicked > -1 && board.canPlace(xClicked, yClicked, board.getCurrentPlayerName())){
    const canvas = document.querySelector("#glCanvas");
    let xMouse = Math.floor(x/(canvas.width/board.size)), yMouse = Math.floor(y/(canvas.height/board.size));
    quadrant = generateRectVertRange(gl, VBO.findByName("lightColor"), board.size, xClicked, xMouse, yClicked, yMouse, board, 5, quadrant);
  }
}

function mouseClick(e){
  if(e.button == 0 && !board.getGameState()){
    let change = false;
    const canvas = document.querySelector("#glCanvas");
    let xCanvas = document.getElementById("glCanvas").getBoundingClientRect().width;
    let yCanvas = document.getElementById("glCanvas").getBoundingClientRect().height;
    let xMouse = Math.floor(x/(canvas.width/board.size)), yMouse = Math.floor(y/(canvas.height/board.size));

    if(xClicked > -1 && yClicked > -1){
      if(board.canPlace(xClicked, yClicked, board.getCurrentPlayerName()) &&
      generateBoardPlayedArea(gl, VBO.findByName(board.getCurrentPlayerName()), board, xClicked, xMouse, yClicked, yMouse, 5, quadrant, VBO.findByName("pointRectIndicator")) ){
        change = true;
        xClicked = -1;
        yClicked = -1;
        clearOverlayColor(gl, VBO.findByName("lightColor"));
        clearOverlayColor(gl, VBO.findByName("preColor"));
      }
    }else{
        xClicked = xMouse;
        yClicked = yMouse;
      if(board.canPlace(xClicked, yClicked, board.getCurrentPlayerName())){
        generateGreenRect(gl, VBO.findByName("preColor"), board.size, xMouse, yMouse);
      }else{
        xClicked = -1;
        yClicked = -1;
      }
    }
    if(change && !board.isOtherPlayerDone()){
      board.changeCurrentPlayer(VBO.findByName("lightColor"), VBO.findByName("preColor"));
      console.log(`${board.getTurnTimer()} seconds left.`, board.getCurrentPlayerName());
      board.doTimeStamp();
      board.setTurnTimerCheck(0);
    }else if(change && board.isOtherPlayerDone()){
      console.log(`${board.getTurnTimer()} seconds left.`, board.getCurrentPlayerName());
      board.doTimeStamp();
      board.setTurnTimerCheck(0);
    }
  }else if(e.button == 2){
    clearOverlayColor(gl, VBO.findByName("lightColor"));
    clearOverlayColor(gl, VBO.findByName("preColor"));
    xClicked = -1;
    yClicked = -1;
    quadrant = 0;
  }
}

function animationLoop(){
  // feedback loop requests new frame
  requestAnimFrame( animationLoop );
  if(inputFocusState && ++counterTextIndicator == 60){
    glConsole.doTextIndicator(true);
  }else if(counterTextIndicator == 100){
    glConsole.doTextIndicator(false);
    counterTextIndicator = 0;
  }

  if(!board.getGameState())
    turnTime();

  // render function is defined below
  draw(gl, glStuff, VBO);
}

function turnTime(){
  
  if(board.getTurnTimerCheck() == 0 && new Date().getTime() - board.getTimeStamp()  >= (board.getTurnTimer()*0.5*1000)){
    console.log(`${board.getTurnTimer()/2} seconds left.`, board.getCurrentPlayerName());
    board.setTurnTimerCheck(1);
  }else if(board.getTurnTimerCheck() == 1 && new Date().getTime() - board.getTimeStamp()  >= (board.getTurnTimer()*0.75*1000)){
    console.log(`${board.getTurnTimer()/4} seconds left.`, board.getCurrentPlayerName());
    board.setTurnTimerCheck(2);
  }else if(new Date().getTime() - board.getTimeStamp()  >= (board.getTurnTimer()*1000)){
    board.playerDone(VBO.findByName("lightColor"), VBO.findByName("preColor"));
    if(!board.getGameState()) console.log(`${board.getTurnTimer()} seconds left.`, board.getCurrentPlayerName());
    board.doTimeStamp();
    board.setTurnTimerCheck(0);
  }
}
