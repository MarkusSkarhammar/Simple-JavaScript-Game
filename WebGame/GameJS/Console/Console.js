export default function temp(){ return 1;};
export {generateGLConsole, GLConsole};


class Event {
    constructor(text, color) {
        this.text = text;
        this.color = color;
    }
}

class GLConsole{
    constructor(){
        this.commands = [];
        this.maxCommands = 1000;
        this.events = [""];
        this.previousInputs = [];
        this.currentInputPos = 0;
        this.currentInput = "";
        this.currentInputStart = "> ";
        this.maxInputStored = 100;
        this.indicator = "";
        this.indicatorPos = 0;
        this.output = document.getElementById("glConsole").getContext("2d");
        this.input = document.getElementById("glInput").getContext("2d");
        this.x = document.getElementById("glConsole").getBoundingClientRect().width;
        this.y = document.getElementById("glConsole").getBoundingClientRect().height;
        this.xInput = document.getElementById("glInput").getBoundingClientRect().width;
        this.yInput = document.getElementById("glInput").getBoundingClientRect().height;
        this.textSize = 15;
        console.log = function(text, color = "black"){
            glConsole.log(text, color);
        };
        console.error = function(text){
            glConsole.log(text, "red");
        };
        console.warn = function(text){
            glConsole.log(text, "yellow");
        };
        console.info = function(text){
            glConsole.log(text);
        };
        this.newInput();
    }
    // Log a new event
    log(text, color = ""){
        // Make sure input is a string
        if(typeof text === "string"){
            // Check if text is longer than the canvas
            if(text.length * this.textSize > this.x){
                let currentLength = 0, subStrings = [], tempString = "";
                for(let i=0; i<text.length; i++){
                    tempString += text[i];
                    currentLength = this.output.measureText(tempString).width;
                    // If text is longer than canvas split it up
                    if(currentLength > this.x-this.textSize*2-this.x*0.01){
                        if(text[i] !== " ") tempString += "-";
                        subStrings.push(tempString);
                        tempString="";
                        currentLength = 0;
                    }else if(i == text.length-1){ // Substring the last part of the text
                        subStrings.push(tempString);
                    }
                }
                for(let subs in subStrings){
                    if(this.events.length == 0){
                        this.events.push(new Event(subStrings[subs], color));
                    }else
                        this.events.unshift(new Event(subStrings[subs], color));
                }
            }else
                this.events.unshift(new Event(text, color));
            this.newEvent();
        }
        
    }
    // Handle printing the console whenever an event occurs.
    newEvent(){
        this.output.clearRect(0, 0, this.x, this.y);
        this.output.font = `${this.textSize}px Arial`;
        let currentY = this.y-this.y*0.05;
        //console.log("canvas bottom:" + this.yStart + ", canvas width: " + this.y + ", draw at: " + currentY);
        for(let item in this.events){
            if(this.events[item].color !== "") {
                this.output.fillStyle = `${this.events[item].color}`;
            }else
                this.output.fillStyle = `black`;
            this.output.fillText(this.events[item].text, 10, currentY);
            currentY -= this.textSize + this.textSize*0.5;
            if(currentY < 0) {
                break;
            }
        }
        //console.log("Last item: " + this.events[0].text);
    }
    // Update the console output/input area
    updateConsole(){
        this.x = document.getElementById("glConsole").getBoundingClientRect().width;
        this.y = document.getElementById("glConsole").getBoundingClientRect().height;
        this.xInput = document.getElementById("glInput").getBoundingClientRect().width;
        this.yInput = document.getElementById("glInput").getBoundingClientRect().height;
        this.newEvent();
        this.newInput();
    }
    // Handle input
    inputText(text){
        if(typeof text === "string"){
            if(this.indicatorPos == this.currentInput.length){
                this.currentInput += text;
            }else{
                this.currentInput = this.currentInput.slice(0, this.indicatorPos) + text + this.currentInput.slice(this.indicatorPos);
            }
            this.indicatorPos++;
            this.newInput();
        }
    }
    // Clear input
    clearInput(){
        this.currentInput = "";
        this.indicatorPos = 0;
        this.newInput();
    }
    // Get previous input
    previousInput(){
        if(this.currentInputPos < this.previousInputs.length){
            this.currentInput = this.previousInputs[this.currentInputPos];
            this.currentInputPos++;
            this.newInput();
        }
    }
    // Get previous input
    nextInput(){
        if(this.currentInputPos > 0){
            this.currentInput = this.previousInputs[--this.currentInputPos];
            this.newInput();
        }
    }
    moveIndicator(direction){
        if(direction === "left"){
            if(this.indicatorPos > 0)
                this.indicatorPos--;
        }else{
            if(this.indicatorPos < this.currentInput.length)
                this.indicatorPos++;
        }
        this.newInput();
    }
    // Handle updating input area
    newInput(){
        this.input.clearRect(0, 0, this.xInput, this.yInput);
        this.input.font = `${this.textSize}px Arial`;
        let currentY = this.yInput-this.yInput*0.40;
        this.input.fillStyle = `black`;
        this.input.fillText(this.currentInputStart + this.currentInput, 10, currentY);
        
        this.input.fillText(this.indicator, 10 + (this.input.measureText(this.currentInputStart + this.currentInput.slice(0, this.indicatorPos)).width), currentY);
    }
    // Add/remove text indicator
    doTextIndicator(state){
        if(state){
            this.indicator = "";
            this.newInput();
        }else{
            this.indicator = "|";
            this.newInput();
        }
    }
    // Remove a typed letter
    backspace(){
        if(this.indicatorPos == 1 && this.currentInput.length == 1){
            this.currentInput = "";
            this.indicatorPos--;
        }else if(this.indicatorPos == 1 && this.currentInput.length > 1){
            this.currentInput = this.currentInput.slice(this.indicatorPos);
            this.indicatorPos--;
        }else if(this.indicatorPos > 0){
            this.currentInput = this.currentInput.slice(0 , this.indicatorPos-1) + this.currentInput.slice(this.indicatorPos);
            this.indicatorPos--;
        }
        this.newInput();
    }
    // Handle inputs
    enterCommand(){
        if(this.currentInput[0] === "/"){
            let command = this.findCommand(this.currentInput);
            if(command.trigger != "nothing"){
                if(command.extra == 1){ // Handle commands with one value provided
                    command.className[command.func](...command.params, this.extractValues(this.currentInput)[0]);
                }else if(command.extra == 2){ // Handle commands with two values provided
                    let values = this.extractValues(this.currentInput);
                    console.log(values);
                }else
                    command.className[command.func](...command.params);
            }
        }else{
            this.log(`"${this.currentInput}" is not a valid command. For more information type "/help".`);
        }
        if(this.previousInputs.length == 0 || this.currentInput !== this.previousInputs[0]){
            this.previousInputs.unshift(this.currentInput);
            if(this.previousInputs.length > this.maxInputStored){
                this.previousInputs.pop();
            }
        }
        this.currentInput = "";
        this.currentInputPos = 0;
        this.newInput();
    }
    // Check if inputed command exists
    findCommand(input){
        let inputCommand = "";
        for(let i=0; i<input.length; i++){
            if(input[i] != " "){
                inputCommand += input[i];
            }else
                break;
        }
        for(let command in this.commands){
            if(this.commands[command].trigger == inputCommand){
                return this.commands[command];
            } 
        }
        return this.commands[0];
    }
    // Insert commands
    insertCommands(commands){
        this.commands = commands;
    }
    // Clear the console
    clear(){
        this.events = [];
        console.log(``);
        console.log(`Welcome! For the game rules click the textbox below and type /rules, for a list of commands type /help or simply type /start to begin the game. Enjoy!`);
        this.newEvent();
    }
    // Extract values provided with "/" commands
    extractValues(text){
        let values = [], temp = "", beforeValues = true;
        for(let j=0; j<text.length; j++){
            if(beforeValues && text[j] == " "){
                beforeValues = false;
            }else if(!beforeValues && (text[j] == " " || j == text.length-1)){
                temp += text[j];
                values.push(temp);
                temp = "";
            }else if(!beforeValues){
                temp += text[j];
            }
        } 
        return values;
    }
    // Print the currently stored commands
    displayCommands(){
        let helpString = "Commands:", value = " <Value>", extra = "";
        for(let item in this.commands){
            let command = this.commands[item];
            if(command.trigger !== "nothing"){
                for(let i=0; i<command.extra; i++){
                    extra += value;
                }
                if(item != this.commands-1) 
                    helpString += ` ${command.trigger+extra},`;
                else
                    helpString += ` ${command.trigger+extra}.`;
                extra = "";
            }
        }
        this.log(helpString);
    }
};

function generateGLConsole(){
    return glConsole = new GLConsole();
};
