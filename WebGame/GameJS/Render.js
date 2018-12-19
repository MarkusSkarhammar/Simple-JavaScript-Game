export default function temp(){ return 1;};
export {render};

function render(gl, glStuff, buffers){

    //gl.glClear(gl.DEPTH_BUFFER_BIT);
    //gl.glClear(gl.STENCIL_BUFFER_BIT);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(let buff in buffers.array){
      let buffer = buffers.array[buff];
      // Set color
      gl.uniform4fv(glStuff.uGlobalColor, buffer.color);
      // Bind VAO
      gl.bindVertexArray(buffer.VAO);
      if(buffer.type === "triangles"){
        if(buffer.name == "preColorTemp"){
          gl.uniform4fv(glStuff.uGlobalColor, [0.6142, 0.83, 0.6502, 1.0]);
          gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount/2);
          gl.uniform4fv(glStuff.uGlobalColor, [0.78, 0.0, 0.0, 1.0]);
          gl.drawArrays(gl.TRIANGLES, buffer.vertexCount/2, buffer.vertexCount/2);
        }else{
          // Draw bound triangles
          gl.drawArrays(gl.TRIANGLES, 0, buffer.vertexCount);
        }
      }else if(buffer.type === "lines"){
        // Draw bound lines
        gl.drawArrays(gl.LINES, 0, buffer.vertexCount);
      }
    }    
  }