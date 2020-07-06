
let rice=require("@ricejs/server")  
let wxCloud = require("@ricejs/host-wx-cloud")

let config=require("./rice")
rice.init(config)
module.exports=new wxCloud(rice);