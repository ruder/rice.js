const axios = require('axios')

class Main {
    constructor(ctx) {
        this.config = ctx.config; 
    }

    async init(){ 

    } 

    request(url,parmas){
        return new Promise((resolve, reject) => {  
            axios.post(url, parmas)
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

module.exports = Main;