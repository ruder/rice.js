//uni-app
var uniAxois = require("uni-axios")  

class UniChannel {
    constructor(serverUrl) { 
        this.serverUrl = serverUrl;  
    }  
    
    request(params) { 
        return new Promise((resolve, reject) => { 
            var path = this.serverUrl;    

            uniAxois.post(path, params)
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



module.exports = UniChannel