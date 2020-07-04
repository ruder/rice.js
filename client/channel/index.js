//浏览器、Node、React Native
var axios = require("axios")

class Channel {
    constructor(serverUrl) { 
        this.serverUrl = serverUrl;  
    }  
    
    request(params) { 
        return new Promise((resolve, reject) => { 
            var path = this.serverUrl;    
 
            axios.post(path, params)
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