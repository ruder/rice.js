
var OssClient = require("./lib") 

module.exports.init=(ctx, modu, config)=> {  
    if (config.oss) { 
        opts = JSON.parse(JSON.stringify(config.oss));
        opts.path = modu.oss 
        ctx.oss = new OssClient(opts.key,opts.serect,opts.area,opts.bucketName);
    }
}