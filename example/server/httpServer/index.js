let rice=require("../../../server/lib")

let Storage = require("../../../plugins/storage")
let OTS = require("../../../plugins/ots")
let config = require("./rice.js")

let HttpServer = require("../../../server/http-server")

rice.init(config,[OTS,Storage])

new HttpServer(rice,3000).listen();