export default function temp(){ return 1;};
export {initShaderProgram};

function initShaderProgram(GL){
    //Create Program and Shaders
    let shaderId = GL.createProgram();
    var vertId = GL.createShader(GL.VERTEX_SHADER);
    var fragId = GL.createShader(GL.FRAGMENT_SHADER);
    //Load Shader Source (source text are in scripts below)
    var vert = document.getElementById("vertScript").innerHTML;
    var frag = document.getElementById("fragScript").innerHTML;
    //glConsole.log("V: " + vert, "purple");
    //glConsole.log("F: " + frag, "green");
    GL.shaderSource(vertId, vert);
    GL.shaderSource(fragId, frag);
    //Compile Shaders
    GL.compileShader(vertId);
    GL.compileShader(fragId);
    //Check Vertex Shader Compile Status
    if (!GL.getShaderParameter(vertId, GL.COMPILE_STATUS)) {  
        console.log("Vertex Shader Compiler Error: " + GL.getShaderInfoLog(vertId), "red");  
        GL.deleteShader(vertId);
        return null;  
    }
    //Check Fragment Shader Compile Status
    if (!GL.getShaderParameter(fragId, GL.COMPILE_STATUS)) {  
      console.log("Fragment Shader Compiler Error: " + GL.getShaderInfoLog(fragId), "red");  
        GL.deleteShader(fragId);
        return null;  
    }
    //Attach and Link Shaders
    GL.attachShader(shaderId, vertId);
    GL.attachShader(shaderId, fragId);
    GL.linkProgram(shaderId);
    //Check Shader Program Link Status
    if (!GL.getProgramParameter(shaderId, GL.LINK_STATUS)) {
      console.log("Shader Linking Error: " + GL.getProgramInfoLog(shader));
    }
    return shaderId;     
  }