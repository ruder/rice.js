const Params = require("./params");

class Rice { 
    constructor(channel,key,actions) { 
        this.channel = channel; 
        this.params = new Params(key);

        this._inited = false;
        this._init(actions);
    }

    async wait(){
        if(!this._inited){
            await this._sleep(50)
            await this.wait();
        }
    }

    async get(key){
        if(!this._inited){
            await this._sleep(50)
            let g=await this.getGrain(key);
            return g
        }

        return this[key]  
    }

    _sleep(t){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve,t)
        })
    }


    _request(){
        let body=this.params.parse(arguments);
        return this.channel.request(body);
    }

    _init(actions) {
        if(actions)
            this._loadActions(actions);
        else{
            // this._loadLocalActions();
            this._request("grains.getAllActions").then((ms) => {
                for (var mName in ms) {
                    var actions = ms[mName];
                    actions.forEach(c => {
                        this._setAction(mName, c);
                    })
                }
                this._inited = true;
                // this._storeLocalActions(ms);
            }).catch((ex) => {
                console.error('rice.modules.getAllActions.error', ex)
            });
        }

    }

    _setAction(mName, aName) {
        if (!this[mName])
            this[mName] = {};
        var obj = this[mName];

        if (!obj[aName]) {
            obj[aName] = function () {
                var params = [];
                for (var i = 0; i < arguments.length; i++)
                    params.push(arguments[i]);
                return this._request("grains.access", mName, aName, params)
            }.bind(this);
        }

    }

    _loadActions(ms){
        for (var mName in ms) {
            var actions = ms[mName];
            actions.forEach(c => {
                this._setAction(mName, c);
            })
        }
    } 

}

module.exports = {
    create(client,key,actions) {
        return new Rice(client,key,actions)
    }
}