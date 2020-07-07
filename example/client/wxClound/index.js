let Channel=require("@ricejs/client-wx-cloud-channel")
let Rice=require("@ricejs/client") 

let rice = Rice.create(new Channel("rice","default"))

module.exports = rice;