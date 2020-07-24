
const ALYOSS = require('ali-oss');
 
class OSS{
    constructor(key,serect,area,bucketName){
        // console.log('arge',arguments)
        this.oss = new ALYOSS({
          // region以杭州为例（oss-cn-hangzhou），其他region按实际情况填写。
          region: area,
          // 阿里云主账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM账号进行API访问或日常运维，请登录 https://ram.console.aliyun.com 创建RAM账号。
          accessKeyId: key,
          accessKeySecret: serect,
          bucket: bucketName
        }); 
    }
    async exist(key){
        let meta=await this.oss.getObjectMeta(key);
        return !!meta; 
    } 

    async getObject(key){
        try{
            let result=await this.oss.get(key);
            let str=result.content.toString();
            return JSON.parse(str);
            // return content;
        }
        catch(ex){
            return null;
        }
    }

    async uploadObject (key, obj) { 
        let result = await this.oss.put(key, new Buffer(JSON.stringify(obj)));
        return result;
    }

    async uploadStream(key,piper){
        let result = await this.oss.putStream(key, piper);
        return result;
    }

    async delete (key) {
        let result = await this.oss.delete(key);
        return result;
    }

    async list(key){

        const result = await this.oss.list({
            prefix: key,
            delimiter: '/'
          }); 

        //   console.log(result);
        return result.objects||[];
    }

 
}  

module.exports = OSS;