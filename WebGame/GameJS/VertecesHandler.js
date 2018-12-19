export default function temp(){ return 1;};
export {VerticesArray, Vertices};

class Vertices {
    constructor(name = "") {
      this.name=name;
      this.ID = 0;
      this.buf = [];
      this.vertexCount = 0;
      this.VAO;
      this.color = [0.0, 0.0, 0.0, 1.0];
      this.type = "triangles";
    }
    getLastPoint(){
      let buffer = this.buf;
      return [buffer[buffer.length - 2], buffer[buffer.length - 1]];
    }
  }
  class VerticesArray{
    constructor(){
      this.array=[];
    }
    add(arr){
      if(arr instanceof Vertices){
        this.array.push(arr);
      }
    }
    findByName(name){
      if(typeof name  === 'string'){
        for(let element in this.array){
          if(this.array[element].name === name)
            return this.array[element];
        }
        glConsole.log(`Can't find VBO with the name: ${name}`);
      }
    }
  }