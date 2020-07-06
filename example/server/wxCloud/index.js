let rice=require("../../../server/lib") 
let Storage = require("../../../plugins/storage")
let OTS = require("../../../plugins/ots")  
let wxCloud = require("../../../server/wx-cloud") 


let config=require("./rice")
rice.init(config,[OTS,Storage])
module.exports=new wxCloud(rice);