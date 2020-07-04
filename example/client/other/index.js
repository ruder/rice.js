let Channel=require("../../../client/channel")
let Rice=require("../../../client/lib")
let key="123456"

let rice = Rice.create( new Channel("https://service-90ztikug-1256269062.gz.apigw.tencentcs.com/release/test"), key )

module.exports = rice;