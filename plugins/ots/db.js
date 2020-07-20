const TableStore = require("tablestore")
const Table=require("./table")

class DB{
    constructor(opts){
        this.client = new TableStore({ 
            accessKeyId: opts.accessKeyId,
            secretAccessKey: opts.secretAccessKey,
            endpoint: opts.endpoint,
            instancename: opts.instancename
        })

        this.dic={};
    }

    getTable(name,config){
        if(this.dic[name])
            return this.dic[name]

        this.dic[name] = new Table(this.client,config);
        
        return this.dic[name]
    }
}


DB.Boolean = "BOOLEAN";
DB.String = "STRING";
DB.Text = "TEXT";
DB.Int = "INTEGER";
DB.BigInt = "BIGINT";
DB.Float = "FLOAT";
DB.DateTime = "DATE";

module.exports = DB