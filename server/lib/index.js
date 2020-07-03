const grains = require("./grains"); 
const Manager =require("./manager") 

class Ricejs{
    constructor(){
        this.grains = grains;
    }

    init(config,plugins=[]){
        this.config=config;
        this.plugins=plugins;
    }

    start(){
        if(this._runing)
            return;
        this.grains.init(this.config,this.plugins);  
        this.manager = new Manager({
            // moduleRootPath:this.grains.ROOT_PATH,
            module: this.grains,
            key:this.config.key
        });
        this._runing = true;
        return this;
    }

    isRuning(){
        return this._runing;
    }
 
}

let rice=new Ricejs(); 
module.exports = rice;