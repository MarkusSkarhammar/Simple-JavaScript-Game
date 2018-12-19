export {generateCommands};

class Command{
    constructor(trigger, className, func, params = [], extra = 0){
        this.trigger = trigger;
        this.func = func;
        this.params = params;
        this.className = className;
        this.extra = extra;
    }
}

function generateCommands(gl, VBO, glConsole, board){
    let commands = [
    new Command("nothing", "", ""), 
    new Command("/help", glConsole, "displayCommands", [glConsole]),
    new Command("/rules", board, "rules", [], 0),
    new Command("/clear", glConsole, "clear", [], 0),
    new Command("/reset", board, "resetBoard", [gl, VBO, glConsole]),
    new Command("/start", board, "start", [gl, VBO, glConsole]),
    new Command("/setMapSize", board, "setSize", [gl, VBO, glConsole], 1),
    new Command("/setTurnTimer", board, "setTurnTimer", [], 1)
    ];

    return commands;
}