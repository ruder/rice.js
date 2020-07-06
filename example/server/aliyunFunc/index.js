let rice=require("@ricejs/server")  
let AliyunFunc = require("@ricejs/host-aliyun-func")

let config = require("./rice.js")
rice.init(config) 
module.exports=new AliyunFunc(rice);