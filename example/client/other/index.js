let Channel=require("../../../client/channel")
let Rice=require("../../../client/lib")
//这个key必须要(sever)服务端保持一致。可以为空，为空则传输不加密
let key="123456"

//channel可选有：
// ap-chanel：支付宝小程序
// hap-chanel: 快应用
// wx-chanel：微信小程序
// weex-chanel：weex
// uni-channel: uni-app
let rice = Rice.create( new Channel("https://service-90ztikug-1256269062.gz.apigw.tencentcs.com/release/test"), key )

module.exports = rice;