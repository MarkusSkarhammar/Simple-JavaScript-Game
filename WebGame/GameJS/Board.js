import {clearOverlayColor, initBoard, generateBoardVerteces} from './Objects.js';
export default function temp(){ return 1;};
export {Board};

class Position{
    constructor(x, y, name){
        this.x = x;
        this.y = y;
        this.name = name;
    }
}
class Board{
    constructor(size, playerOne, playerTwo, turnTimer = 30){
        this.size = size;
        this.placed = [];
        this.players = [playerOne, playerTwo];
        this.currentPlayer = 1;
        this.turnTimer = turnTimer;
        this.turnTimerStamp = 0;
        this.turnTimerCheck = 0;
        this.gameFinished = true;
    }
    setTurnTimer(turnTimer){
        if(this.getGameState){
            if(turnTimer % 1 == 0){
                this.turnTimer = turnTimer;
                console.log(`Turn timer set to ${turnTimer} seconds.`);
            }else
                console.log(`Can't set the turn timer to "${turnTimer}", please enter a number above 0.`);
        }else  
            console.log(`Can't change the turn timer while a game is progress.`);

    }
    getTurnTimer(){
        return this.turnTimer;
    }
    getTurnTimerCheck(){
        return this.turnTimerCheck;
    }
    setTurnTimerCheck(value){
        this.turnTimerCheck = value;
    }
    setGameState(state){
        this.gameFinished = state;
    }
    changeGameState(){
        this.gameFinished = !this.gameFinished;
    }
    getGameState(){
        return this.gameFinished;
    }
    getTimeStamp(){
        return this.turnTimerStamp;
    }
    doTimeStamp(){
        this.turnTimerStamp = new Date().getTime();
    }
    toString() {
        return "board";
      }
    place(x, y, name){
        if(!this.isPlaced(x, y)){
            this.placed.push(new Position(x, y, name));
            this.players[this.currentPlayer].points++;
            return true;
        }
        return false;
    }
    isPlaced(x, y){
        for(let element in this.placed){
            let pos = this.placed[element];
            if(pos.x == x && pos.y == y){
                return true;
            }
        }
        return false;
    }
    isPlacedArea(xFrom, xTo, yFrom, yTo){
        for(let x=xFrom; x<xTo; x++){
            for(let y=yFrom; y<yTo; y++){
                if(this.isPlaced(x, y)){
                    console.log("Can't place within an area on the board that's been played already.", "black");
                    return true;
                }
            }
        }
        return false;
    }
    isWithinBoard(xFrom, xTo, yFrom, yTo){
        for(let x=xFrom; x<xTo; x++){
            for(let y=yFrom; y<yTo; y++){
                if(x < 0 || x >= this.size || y < 0 || y >= this.size){
                    console.log("Can't place outside of the board.", "black");
                    return false;
                }
            }
        }
        return true;
    }
    canPlace(x, y, name){
        //if(x == 0 && y == 0)
        for(let i=y-1; i<y+2; i++){
            for(let j=x-1; j<x+2; j++){
                if( (i == (y - 1) && j == (x)) || (i == (y + 1) && j == (x)) || (i == (y) && j == (x-1)) || (i == (y) && j == (x+1)) ){
                    let temp = this.getPlaced(j, i);
                    if(temp.name != "empty" && temp.name === name){
                        return true;
                    }
                }
            }
        }
        if(x == 0 && name == this.players[0].name || x == this.size-1 && name == this.players[1].name) return true;
        console.log(`Must be placed next to one or more of the already played rectangles or from the starting side of your color.`, "black");
        return false;
    }
    getPlaced(x, y){
        for(let element in this.placed){
            let pos = this.placed[element];
            if(pos.x == x && pos.y == y){
                return this.placed[element];
            }
        }
        return new Position(0.0, 0.0, "empty");
    }
    getCurrentPlayerName(){
        return this.players[this.currentPlayer].name;
    }
    getCurrentPlayerPoints(){
        return this.players[this.currentPlayer].points;
    }
    changeCurrentPlayer(light, pre){
        if(this.currentPlayer == 0){ // Red
            this.currentPlayer = 1;
            light.color = [1.0, 0.43, 0.43, 1.0];
            pre.color = [0.78, 0.0, 0.0, 1.0]; 
        }else{ // Green
            this.currentPlayer = 0;
            light.color = [0.63, 1.0, 0.69, 1.0];
            pre.color = [0.6142, 0.83, 0.6502, 1.0];
        }
        console.log(`${this.getCurrentPlayerName()}'s turn.`, `${this.getCurrentPlayerName()}`);
    }
    playerDone(light, pre){
        let currentPlayer = this.players[this.currentPlayer];
        let otherPlayer;
        if(this.currentPlayer == 0) otherPlayer = this.players[1];
        else otherPlayer = this.players[0];
        currentPlayer.done = true;

        if(!otherPlayer.done){
            console.log(`${currentPlayer.name} finished with a score of: ${currentPlayer.points} points.`, `${currentPlayer.name}`);
            this.changeCurrentPlayer(light, pre);
        }else{
            if(currentPlayer.points > otherPlayer.points)
                console.log(`${currentPlayer.name} won! Game finished with ${currentPlayer.name}'s ${currentPlayer.points} points to ${otherPlayer.name}'s ${otherPlayer.points} points!.`, `${currentPlayer.name}`);
            else if(currentPlayer.points < otherPlayer.points)
                console.log(`${otherPlayer.name} won! Game finished with ${otherPlayer.name}'s ${otherPlayer.points} points to ${currentPlayer.name}'s ${currentPlayer.points} points!.`, `${otherPlayer.name}`);
            else 
            console.log(`It's a draw! Game finished with ${otherPlayer.name}'s ${otherPlayer.points} points to ${currentPlayer.name}'s ${currentPlayer.points} points!.`, `black`);
            this.endGame();
        }
    }
    isOtherPlayerDone(){
        if(this.currentPlayer == 0){
            return (this.players[1].done);
        }else
        return (this.players[0].done);
    }
    resetBoard(gl, VBO, glConsole){
        this.endGame();
        clearOverlayColor(gl, VBO.findByName("Red"));
        clearOverlayColor(gl, VBO.findByName("Green"));
        clearOverlayColor(gl, VBO.findByName("preColor"));
        clearOverlayColor(gl, VBO.findByName("lightColor"));
        clearOverlayColor(gl, VBO.findByName("pointRectIndicator"));
        this.players[0].done = false;
        this.players[0].points = 0;
        this.players[1].done = false;
        this.players[1].points = 0;
        this.placed = [];
        glConsole.clear();
    }
    start(gl, VBO, glConsole){
        if(this.getGameState()){
            this.resetBoard(gl, VBO, glConsole);
            this.currentPlayer = Math.floor(Math.random()*2); // Randomize starting player
            this.changeCurrentPlayer(VBO.findByName("lightColor"), VBO.findByName("preColor"));
            console.log(`${this.getTurnTimer()} seconds left.`, this.getCurrentPlayerName());
            this.doTimeStamp(); // Start timer
            this.setGameState(false);
        }else
            console.log(`A game is already in progress.`);
    }
    endGame(){
        this.setGameState(true);
    }
    setSize(gl, VBO, glConsole, size){
        if(size % 2 == 0){
            this.endGame();
            this.size = size;
            generateBoardVerteces(gl, VBO.findByName("board"), this.size);
            initBoard(gl, VBO.findByName("preColorTemp"), this);
            this.resetBoard(gl, VBO, glConsole);
            console.log(`Game board changed size to ${size}*${size}.`);
        }else if(size % 2 == 1){
            console.log(`The board size must be an even number`);
        }else{
            console.log(`"${size}" is not a valid input for the size of the board.`);
        } 
    }
    rules(){
        console.log(`The goal of the game is to tag as many rectangles on the board as possible. The board is 20*20 rectangles wide(can be changed) and the players start on the opposite side och eachother. Each rectangle is worth 1 point and you may tag 2*2, 3*3, 4*4, 5*5 rectangles each turn. The turns alternate and a standard timer of 30 sec is imposed (can be changed).` + 
                    ` If a player fails to tag any rectangles within the time limit the game ends for that player while the other player may continue until there's no more rectangles to tag (a player can end the turn by pressing ctrl + s). The game ends when both players can't tag anymore rectangles.`);
    }
}