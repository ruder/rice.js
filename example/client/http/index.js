let Channel=require("../../../client/htt-channel")
let Rice=require("../../../client/lib")
let key="123456"

let rice = Rice.create( new Channel("http://localhost:8080"), key )

module.exports = rice;