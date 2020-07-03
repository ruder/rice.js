let Channel=require("../../../client/channel")
let Rice=require("../../../client/lib")
let key="123456"

let rice = Rice.create( new Channel({serverUrl:"http://localhost:8080"}), key )

module.exports = rice;