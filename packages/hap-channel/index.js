//快应用
 var fetch = require("@system.fetch")
 var Fly=require("flyio/dist/npm/hap")
 var fly=new Fly(fetch)

class HapChannel {
    constructor(serverUrl) { 
        this.serverUrl = serverUrl;  
    }  
    
    request(params) { 
        return new Promise((resolve, reject) => { 
            var path = this.serverUrl;    
 
            fly.post(path, params)
                .then(d => {
                    var data = d.data;
                    if (data.err)
                        return reject(data.err)
                    return resolve(data.d);
                })
                .catch(ex => {
                    reject(ex)
                })

        })
    }
}



module.exports = HapChannel