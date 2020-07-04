let rice=require("../../../server/lib")

let Storage = require("../../../plugins/storage")
let OTS = require("../../../plugins/ots")
let config = require("./rice.js")

let QcloudFunc = require("../../../server/qcloud-func")

rice.init(config,[OTS,Storage])

module.exports=new QcloudFunc(rice);