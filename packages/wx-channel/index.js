//微信小程序
var Fly=require("flyio/dist/npm/wx") 
var fly=new Fly

class WxChannel {
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



module.exports = WxChannel