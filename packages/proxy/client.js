class RiceProxyClient{
    constructor(rice,serverUrl,actions){
        this.rice=rice;
        this.serverUrl=serverUrl; 
        this.actions=actions;

        this.init();
    }

    init(){
        let ms=this.actions||{}
        for (var mName in ms) {
            var actions = ms[mName];
            actions.forEach(c => {
                this._setAction(mName, c);
            })
        }
    }

    _request(){
        // console.log(arguments)
        let body=this.rice.params.parse(arguments);
        return this.rice.proxy.excute(this.serverUrl,body);
    }

    _setAction(mName, aName) {
        if (!this.rice[mName])
            this.rice[mName] = {};
        var obj = this.rice[mName];

        if (!obj[aName]) {
            obj[aName] = function () {
                var params = [];
                for (var i = 0; i < arguments.length; i++)
                    params.push(arguments[i]);
                return this._request("grains.access", mName, aName, params)
            }.bind(this);
        }

    }
}

module.exports=RiceProxyClient