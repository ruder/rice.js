let Channel=require("../../../client/func-channel")
let Rice=require("../../../client/lib")
let key="123456"

let rice = Rice.create( new Channel("https://243452313.cn-qingdao.fc.aliyuncs.com/2016-08-15/proxy/serv/name/ "), key )

module.exports = rice;