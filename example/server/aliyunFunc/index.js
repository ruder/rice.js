let rice=require("../../../server/lib")

let Storage = require("../../../plugins/storage")
let OTS = require("../../../plugins/ots")
let config = require("./rice.js")

let AliyunFunc = require("../../../server/aliyun-func")

rice.init(config,[OTS,Storage])

module.exports=new AliyunFunc(rice);