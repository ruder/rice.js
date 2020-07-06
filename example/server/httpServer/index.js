let rice=require("@ricejs/server")  
let HttpServer = require("@ricejs/host-http-server")

let config = require("./rice.js") 

rice.init(config)

new HttpServer(rice,3000).listen();