import {updateBuffer} from './Buffers.js';
export{ generateBoardVerteces, generateGreenRect, clearOverlayColor, generateRectVertRange, generateBoardPlayedArea, initBoard};

function generateBoardVerteces(gl, buff, amount){
    let side = 1.0/(amount/2), verteces = [];
    // Create verteces for the vertical lines
    for(let i=0; i<amount; i++){
        if(i < amount/2){
            verteces.push(side * i * -1.0);
            verteces.push(1.0);
            verteces.push(side * i * -1.0);
            verteces.push(-1.0);
        }else{
            verteces.push(side * i + -1.0);
            verteces.push(1.0);
            verteces.push(side * i + -1.0);
            verteces.push(-1.0);
        }
    }
    // Create verteces for the horizontal lines
    for(let i=0; i<amount; i++){
        if(i < amount/2){
            verteces.push(-1.0);
            verteces.push(side * i);
            verteces.push(1.0);
            verteces.push(side * i);
        }else{
            verteces.push(-1.0);
            verteces.push(((side * i - 1.0) * -1.0));
            verteces.push(1.0);
            verteces.push(((side * i - 1.0) * -1.0));
        }
    }
    let arr = new Float32Array(verteces);

      updateBuffer(gl, buff, arr);
}

function generateGreenRect(gl, buff, amount, x, y){
    let side = 1.0/(amount/2);
    let verteces = [];

    // First Triangle
    verteces.push(-1.0 + side * x);
    verteces.push(1.0 - side * y);
    verteces.push(-1.0 + side * x + side);
    verteces.push(1.0 - side * y);
    verteces.push(-1.0 + side * x);
    verteces.push(1.0 - side * y- side);
    // Second Triangle
    verteces.push(-1.0 + side * x + side);
    verteces.push(1.0 - side * y);
    verteces.push(-1.0 + side * x + side);
    verteces.push(1.0 - side * y - side);
    verteces.push(-1.0 + side * x);
    verteces.push(1.0 - side * y - side);
    verteces.push(...buff.buf);
    let arr = new Float32Array(verteces);
    updateBuffer(gl, buff, arr);
}

function clearOverlayColor(gl, buff){
    let arr = new Float32Array([]);
    updateBuffer(gl, buff, arr);
}

function generateRectVertRange(gl, buff, amount, xFrom, xTo, yFrom, yTo, board, maxWidth, quadrant){
    let side = 1.0/(amount/2);
    let verteces = [];
    let xStart = xFrom, xStop = xTo + 1, yStart = yFrom, yStop = yTo + 1, xLength, yLength, difference;
    xLength = Math.abs(xTo - xFrom);
    yLength = Math.abs(yTo - yFrom);
    difference = Math.abs(xLength-yLength);
    // Logic for determining the area of the lightGreen rects
    if(xTo-xFrom < 0 && yTo-yFrom < 0){ // First Quadrant
        {// Swap direction for both x and y coordinates so that the coordinate system goes x to west and y to north
            xStart = xTo;
            xStop = xFrom + 1;
            yStart = yTo;
            yStop = yFrom + 1;
        }
        if(xLength < yLength){
            xStart -= difference;
        }else{
            yStart -= difference;
        }
        quadrant = 1;
    }else if(xTo-xFrom < 0){ // Third quadrant logic
        if(quadrant == 1 && yLength == 0){
            xStart -= difference;
            xStop += difference;
            yStart -= difference;
        }else{
            xStart = xTo;
            xStop = xFrom + 1;
            if(xLength > yLength){
                yStop += difference;
            }else{
                xStart -= difference;
            }
            quadrant = 3;
        }
    }else if(yTo-yFrom < 0) { // Second quadrant logic
        if(quadrant == 1 && xLength == 0){
            yStart -= difference;
            yStop += difference;
            xStart -= difference;
        }else{
            yStart = yTo;
            yStop = yFrom + 1; 
            if(xLength > yLength){
                yStart -= difference;
            }else if(xLength < yLength){
                if(xFrom > xTo){
                    xStart -= difference;
                }else
                    xStop += difference;
            }
            quadrant = 2;
        }
    }else if(!(xTo-xFrom < 0 && yTo-yFrom < 0)){ // Fourth quadrant logic
        if(quadrant == 2 && yLength == 0){
            yStart -= difference;
        }else if(quadrant == 3 && xLength == 0){
            xStart -= difference;
        } else{
            if(xLength > yLength){
                yStop += difference;
            }else{
                xStop += difference;
            }
            quadrant = 4;
        }
    }
    // Generate the verteces for the lightGreen rects
    if((xLength != 0 || yLength != 0) && xLength <= maxWidth && yLength <= maxWidth){
        if( ((yStop-yStart) <= maxWidth && (xStop-xStart) <= maxWidth) || ((yStop-yStart) <= maxWidth && (xStop-xStart) > maxWidth) || ((yStop-yStart) > maxWidth && (xStop-xStart) <= maxWidth)){
            clearOverlayColor(gl, buff);
            for(let y=yStart; y<yStop; y++){
                if((yStop-yStart) > maxWidth) break;
                for(let x=xStart; x<xStop; x++){
                    if((xStop-xStart) > maxWidth) break;
                    // First Triangle
                    verteces.push(-1.0 + side * x);
                    verteces.push(1.0 + (- side * y));
                    verteces.push(-1.0 + (side * x + side));
                    verteces.push(1.0 + (- side * y));
                    verteces.push(-1.0 + side * x  );
                    verteces.push(1.0 + ( - side * y - side) );
                    // Second Triangle
                    verteces.push(-1.0 + (side * x + side) );
                    verteces.push(1.0 + (- side * y));
                    verteces.push(-1.0 + (side * x + side) );
                    verteces.push(1.0 + ( - side * y - side) );
                    verteces.push(-1.0 + side * x  );
                    verteces.push(1.0 + (- side * y - side) );
                }
            }
        }   
    }
    verteces.push(...buff.buf);
    let arr = new Float32Array(verteces);
    updateBuffer(gl, buff, arr);
    return quadrant;
}

function generateBoardPlayedArea(gl, buff, board, xFrom, xTo, yFrom, yTo, maxWidth, quadrant, buffPoints){
    let side = 1.0/(board.size/2);
    let verteces = [];
    let xStart = xFrom, xStop = xTo + 1, yStart = yFrom, yStop = yTo + 1, xLength, yLength, difference;
    xLength = Math.abs(xTo - xFrom);
    yLength = Math.abs(yTo - yFrom);
    if(xLength > 4){
        if(xStart > xStop){
            xTo += xLength - 4;
        }else{
            xStop -= xLength - 4;
        }
        xLength = 4;
    }
    if(yLength > 4){
        if(yStart > yStop){
            yTo += yLength - 4;
        }else
            yStop -= yLength - 4;
        yLength = 4;
    }
    difference = Math.abs(xLength-yLength);
    // Logic for determining the area of the lightGreen rects
    if(xTo-xFrom < 0 && yTo-yFrom < 0){ // First Quadrant
        {// Swap direction for both x and y coordinates so that the coordinate system goes x to west and y to north
            xStart = xTo;
            xStop = xFrom + 1;
            yStart = yTo;
            yStop = yFrom + 1;
        }
        if(xLength < yLength){
            xStart -= difference;
        }else{
            yStart -= difference;
        }
        quadrant = 1;
    }else if(xTo-xFrom < 0){ // Third quadrant logic
        if(quadrant == 1 && yLength == 0){
            xStart -= difference;
            xStop += difference;
            yStart -= difference;
        }else{
            xStart = xTo;
            xStop = xFrom + 1;
            if(xLength > yLength){
                yStop += difference;
            }else{
                xStart -= difference;
            }
            quadrant = 3;
        }
    }else if(yTo-yFrom < 0) { // Second quadrant logic
        if(quadrant == 1 && xLength == 0){
            yStart -= difference;
            yStop += difference;
            xStart -= difference;
        }else{
            yStart = yTo;
            yStop = yFrom + 1; 
            if(xLength > yLength){
                yStart -= difference;
            }else if(xLength < yLength){
                if(xFrom > xTo){
                    xStart -= difference;
                }else
                    xStop += difference;
            }
            quadrant = 2;
        }
    }else if(!(xTo-xFrom < 0 && yTo-yFrom < 0)){ // Fourth quadrant logic
        if(quadrant == 2 && yLength == 0){
            yStart -= difference;
        }else if(quadrant == 3 && xLength == 0){
            xStart -= difference;
        } else{
            if(xLength > yLength){
                yStop += difference;
            }else{
                xStop += difference;
            }
            quadrant = 4;
        }
    }
    if(!board.isPlacedArea(xStart, xStop, yStart, yStop) && board.isWithinBoard(xStart, xStop, yStart, yStop)){
        pointRectIndicator(gl, board, buffPoints, xStart, xStop, yStart, yStop, glConsole);
        let tempPoints = board.getCurrentPlayerPoints();
        // Generate the verteces for the lightGreen rects
        if((xLength != 0 || yLength != 0) && xLength <= maxWidth && yLength <= maxWidth){
            if( ((yStop-yStart) <= maxWidth && (xStop-xStart) <= maxWidth) || ((yStop-yStart) <= maxWidth && (xStop-xStart) > maxWidth) || ((yStop-yStart) > maxWidth && (xStop-xStart) <= maxWidth)){
                for(let y=yStart; y<yStop; y++){
                    if((yStop-yStart) > maxWidth) break;
                    for(let x=xStart; x<xStop; x++){
                        if((xStop-xStart) > maxWidth) break;
                        board.place(x, y, buff.name);
                        // First Triangle
                        verteces.push(-1.0 + side * x);
                        verteces.push(1.0 + (- side * y));
                        verteces.push(-1.0 + (side * x + side));
                        verteces.push(1.0 + (- side * y));
                        verteces.push(-1.0 + side * x  );
                        verteces.push(1.0 + ( - side * y - side) );
                        // Second Triangle
                        verteces.push(-1.0 + (side * x + side) );
                        verteces.push(1.0 + (- side * y));
                        verteces.push(-1.0 + (side * x + side) );
                        verteces.push(1.0 + ( - side * y - side) );
                        verteces.push(-1.0 + side * x  );
                        verteces.push(1.0 + (- side * y - side) );
                    }
                }
                console.log(`${board.getCurrentPlayerName()} scored ${board.getCurrentPlayerPoints()-tempPoints} points for a total of ${board.getCurrentPlayerPoints()}.`, `${board.getCurrentPlayerName()}`);
            }   
        }
    }else
        return false;

    verteces.push(...buff.buf);
    let arr = new Float32Array(verteces);

    updateBuffer(gl, buff, arr);
    return true;
}

function initBoard(gl, buff, board){
    let side = 1.0/(board.size/2);
    let verteces = [];

    for(let i=0; i<2; i++){
        for(let y=0; y<board.size; y++){
            let x = 0;
            if(i == 1) x = board.size-1;
            // First Triangle
            verteces.push(-1.0 + side * x);
            verteces.push(1.0 - side * y);
            verteces.push(-1.0 + side * x + side);
            verteces.push(1.0 - side * y);
            verteces.push(-1.0 + side * x);
            verteces.push(1.0 - side * y- side);
            // Second Triangle
            verteces.push(-1.0 + side * x + side);
            verteces.push(1.0 - side * y);
            verteces.push(-1.0 + side * x + side);
            verteces.push(1.0 - side * y - side);
            verteces.push(-1.0 + side * x);
            verteces.push(1.0 - side * y - side);
        }   
    }

    let arr = new Float32Array(verteces);

    updateBuffer(gl, buff, arr);
}

function pointRectIndicator(gl, board, buff, xFrom, xTo, yFrom, yTo, glConsole){
    let side = 1.0/(board.size/2);
    let verteces = [];

    // First line: Top
    {
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yFrom);
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yFrom);
    }
    // Second line: Right
    {
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yFrom);
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yTo);
    }
    // Third line: Bottom
    {
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yTo);
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yTo);
    }
    // Fourth line: Left
    {
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yTo);
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yFrom);
    }
    // Fifth line: From left bottom to top right 
    {
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yTo);
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yFrom);
    }
    // Sixth line: From right bottom to top left 
    {
        verteces.push(-1.0 + side * xTo);
        verteces.push(1.0 - side * yTo);
        verteces.push(-1.0 + side * xFrom);
        verteces.push(1.0 - side * yFrom);
    }

    verteces.push(...buff.buf);
    let arr = new Float32Array(verteces);

    updateBuffer(gl, buff, arr);
}