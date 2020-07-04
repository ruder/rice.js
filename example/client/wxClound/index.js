let Channel=require("../../../client/wx-cloud-channel")
let Rice=require("../../../client/lib")
let key="123456"

let rice = Rice.create( new Channel("rice"), key )

module.exports = rice;