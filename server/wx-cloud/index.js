const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

let rootRice=null;
class WeixinFunc{
    constructor(rice){
        this.rice=rice;
    }

    async main(event, context) { 
    
        if(rootRice && !rootRice.isRuning())
            rootRice.start();   
     
        let result = await rootRice.manager.response(event); 
        return result; 
    }
}

module.exports = WeixinFunc;