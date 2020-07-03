let rice=require("../../../server/lib") 
let Storage = require("../../../plugins/storage")
let OTS = require("../../../plugins/ots")  
let WeixinFunc = require("../../../server/weixin-func") 


let config=require("./rice")
rice.init(config,[OTS,Storage])
module.exports=new WeixinFunc(rice);