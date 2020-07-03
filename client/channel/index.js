
var axois = require("uni-axios") 

class Channel {
    constructor(option) { 
        this.serverUrl = (option.serverUrl + "/excute").replace(/[\/]+/ig,"/");  
    }  
    
    request(params) { 
        return new Promise((resolve, reject) => { 
            var path = this.serverUrl;    

            axois.post(path, params)
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



module.exports = Channel