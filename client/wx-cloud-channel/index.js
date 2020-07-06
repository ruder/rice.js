//微信小程序云开发
class WxCloudChannel {
    constructor(functionName,env) { 
        this.functionName = functionName ;   
    
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            let option={
                traceUser: true,
            }
            
            // env 参数说明：
            //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
            //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
            //   如不填则使用默认环境（第一个创建的环境） 
            if(env)
                option.env=env;
            wx.cloud.init(option)
        }
    } 
 
    
    request(params) {

        return new Promise((resolve, reject) => {   
            
            wx.cloud.callFunction({
                name: this.functionName,
                data: params,
                success: res => { 
                    var data = res.result;
                    if (data.err)
                        return reject(data.err)
                    return resolve(data.d);
                 
                },
                fail: err => {
                    return reject(err) 
                }
              })

        })
    }
}



module.exports = WxCloudChannel