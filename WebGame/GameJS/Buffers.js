export default function temp(){ return 1;};
export {updateBuffer, generateVBOs};

function updateBuffer(gl, buffer, vertices){
  buffer.buf = vertices;
  buffer.vertexCount = buffer.buf.length/2;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.ID);
  gl.bufferData(gl.ARRAY_BUFFER, buffer.buf, gl.STATIC_DRAW);
}
  
function generateVBOs(gl, VAO, buffers, positionLoc){
  for(let buff in buffers.array){
    let buffer = buffers.array[buff];
      VAO.push(gl.createVertexArray());

      gl.bindVertexArray(VAO[buff]);
      buffer.ID = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.ID);
      gl.bufferData(gl.ARRAY_BUFFER, 0, gl.STATIC_DRAW);
      
      gl.enableVertexAttribArray(positionLoc);
      gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

      buffer.VAO = VAO[buff];

      if(buffer.name === "Green"){
        buffer.color = [0.1, 0.7, 0.2, 1.0]; // green
      }else if(buffer.name === "Red"){
        buffer.color = [1, 0.0, 0.0, 1.0]; // green
      }else if(buffer.name === "board" || buffer.name === "pointRectIndicator"){
        buffer.type = "lines";
      }else if(buffer.name === "preColorTemp"){
        buffer.color = [0.78, 0.0, 0.0, 1.0]; 
      }
  }
  //buffers[0].color = [0.1, 0.7, 0.2, 1.0]; // green
  //buffers[1].color = [0.65, 0.49, 0.24, 1.0]; // bronze
}