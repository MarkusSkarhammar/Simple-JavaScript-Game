export {keystrokeHeld, keystrokeUp};

function keystrokeHeld(e, shift, ctrl){
    //console.log(e.keyCode);
    if(shift && e.keyCode == 55 || e.keyCode == 38 || e.keyCode == 40){
        if(e.keyCode == 55){
            glConsole.inputText("/");
        }else if(e.keyCode == 38){
            glConsole.previousInput();
        }else if(e.keyCode == 40){
            glConsole.nextInput();
        }
    }else if(e.keyCode >= 65 && e.keyCode <= 90 || e.keyCode == 32 || e.keyCode >= 48 && e.keyCode <= 57){
        glConsole.inputText("" + e.key);
    }else if(e.keyCode == 8){
        if(ctrl){
            glConsole.clearInput();
        }else
            glConsole.backspace();
    }else if(e.keyCode == 13){
        glConsole.enterCommand();
    }else if(e.keyCode == 37){
        glConsole.moveIndicator("left");
    }else if(e.keyCode == 39){
        glConsole.moveIndicator("right");
    }
}

function keystrokeUp(e, shift, ctrl){
    //console.log(e.keyCode);
    if(shift){
       
    }
}