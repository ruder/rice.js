var jsonBody = require("../http-server/node_modules/body/json") 

let rootRice=null;

class AliyunFunc{
    constructor(rice){
        rootRice=rice;
    }

    handler (req, resp, context) { 
    
        if(rootRice && !rootRice.isRuning())
            rootRice.start(); 

        jsonBody(req, async function (err, formBody) {
            let params = {}
            for (var key in req.queries) {
                var value = req.queries[key];
                params[key] = value; 
            }
            for (let key in formBody){ 
                var value = formBody[key];
                params[key] = value;
            }
    
            try {
                // console.log(params);
                let result = await rootRice.manager.response(params);
                resp.setHeader('Content-Type', "application/json");
                resp.send(JSON.stringify(result));
            }
            catch (ex) {
                resp.send(ex.toString())
            }
        }); 
    }
}

module.exports=AliyunFunc;