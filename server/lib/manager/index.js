var AES = require('./aes');  

class Server {

    constructor(option) {
        option = option || {}; 
        this.moduleRootPath = option.moduleRootPath ; 
        this.module = optoin.module;
        this.key = option.key; 

        if(this.key) this.crypto = new AES.Crypto(this.key);
    }

    async response(body) { 
        try {

            if (body.encrypt != "true" && body.key != this.key) {
                return { err: "密钥不正确！" }; 
            }

            var str = body.parmas;
            //如果用AES加密
            if (body.encrypt == "true" && this.crypto) {
                str = decodeURI(this.crypto.decrypt(str));
                var time = parseInt(str.substr(0, 13)) || 0;
                if (new Date().getTime() - time > 3600000 * 10) {
                    return { err: "密钥不正确！" }; 
                }
                str = str.substr(13);
            }

            var parmas = JSON.parse(str);
            var pns = parmas[0].split('.');
            var mname = pns.pop();
            var mpath = this.moduleRootPath + pns.join("/");
            var m = this.module || require(mpath);
            if (!m) {
                return { err: "无法找到指定的模块！" }; 
            }
            var mothod = m[mname];
            if (!mothod) {
                return { err: "无法找到指定的操作！" }; 
            }

            if (mothod.constructor && mothod.constructor.name == 'AsyncFunction') {
                var date = new Date().getTime();
                try {
                    parmas.splice(0, 1); 

                    var d = await mothod.apply(m, parmas);
                    return { err: null, d: d };
                }
                catch (ex) {
                    return { err: ex.stack || ex };
                }
            }
            else if (mothod.constructor && mothod.constructor.name == 'Function') {
                var callbackfuction = function (err, d) {
                    return { err: err, d: d };
                };

                for (var i = 0; i < parmas.length; i++) {
                    if (parmas[i] == "callback") {
                        parmas[i] = callbackfuction;
                    }
                    else {
                        parmas[i] = parmas[i];
                    }
                }

                parmas.splice(0, 1);
                parmas.push(req);
                parmas.push(res);
                mothod.apply(m, parmas);

            }
            else {
                var d = mothod;
                return { err: null, d: d };
            }

        }
        catch (e) {
            //throw  e;
            console.error("commServer error:" + e.stack);
            return { err: e };
        }
    };
 
}

module.exports = Server;