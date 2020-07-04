var jsonBody = require("body/json") 

let rootRice=null;

class QcloudFunc{
    constructor(rice){
        rootRice=rice;
    }

    async main_handler (event, context, callback) {  
        if(rootRice && !rootRice.isRuning())
            rootRice.start();  
    
        try { 
            let params=JSON.parse(event)
            let result = await rootRice.manager.response(params); 
            return result;
        }
        catch (ex) {
            return ex.toString()
        }
    } 
}

module.exports=QcloudFunc;