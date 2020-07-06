 


let rice=require("@ricejs/server")  
let QcloudFunc = require("@ricejs/host-qcloud-func")

let config = require("./rice.js") 

rice.init(config)

module.exports=new QcloudFunc(rice);