module.exports = {
    async excute(url,params){
        let result=await this.request(url,params)
        return result;
    }
}