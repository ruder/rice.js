
class Main {
    constructor(ctx) {
        this.config = ctx.config; 
        this.ots=ctx.ots;

    }

    async init(){
        try{
            console.log("abc")
            let db = await this.ots.getDB("testTable");

            let id='test2'
            await db.set(id,{name:"张不旧爱",year:30,score:2.4})

            let obj=await db.get(id);
            console.log(obj)
            // let list=await db.search({name:"张不旧爱"},null,0,2,"-year")
            let list=await db.search({name:"张不旧爱",year:{$gt:20,$lt:40}},null,0,2,"-year")
            console.log(list)
            let count=await db.getCount({name:"张不旧爱",year:{$gt:20,$lt:40}})
            console.log(count)
        }
        catch(ex){
            console.error(ex);
        }

    } 

    getTest(id){
        let db = await this.ots.getDB("testTable");
        let obj=await db.get(id)
        return obj;
    }

}

module.exports = Main;