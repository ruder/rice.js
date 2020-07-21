module.exports = { 
    async get(id){
        let result=await this.getTest(id)
        return result;
    }
}