let Channel=require("../../../client/wx-cloud-channel")
let Rice=require("../../../client/lib")
//这个key必须要(sever)服务端保持一致。可以为空，为空则传输不加密
let key="123456"

let rice = Rice.create( new Channel("rice","default"), key )

module.exports = rice;