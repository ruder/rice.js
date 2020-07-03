var AES = require("./aes");

class Params{
    constructor(key){
        if(key)  this.encrypt = new AES.Crypto(this.key); 
    }

    parse(args){

        var parmas = [];
 
        for (var i = 0; i < args.length; i++) {
            var a = args[i];

            if (i === 0) {
                var key = a;
                if (key.indexOf("http://") === 0 || key.indexOf("https://") === 0) {
                    var index = key.lastIndexOf("/");
                    path = key.substr(0, index + 1);
                    a = key.substr(index + 1);
                }
            }
            parmas.push(a);
        }

        if(this.encrypt) 
            return {
                encrypt: "true",
                parmas: this.encrypt.encrypt(encodeURI(new Date().getTime() + JSON.stringify(parmas)))
            } 
        
        return {encrypt:"false",parmas}

    }
}

module.exports=Params;