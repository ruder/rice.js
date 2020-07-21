const TableStore = require("tablestore")
const Table=require("./table");
const { init } = require(".");

class DB{
    constructor(opts){
        this.client = new TableStore.Client({ 
            accessKeyId: opts.accessKeyId,
            secretAccessKey: opts.secretAccessKey,
            endpoint: opts.endpoint,
            instancename: opts.instanceName
        })

        this.dic={};
    }

    async getTable(name,config){
        if(this.dic[name])
            return this.dic[name]

        this.dic[name] = new Table(name,this.client,config);
        await this.dic[name].init();
        
        return this.dic[name]
    }
}

// TableStore.FieldType = {
//     LONG: 1,
//     DOUBLE: 2,
//     BOOLEAN: 3,
//     KEYWORD: 4,
//     TEXT: 5,
//     NESTED: 6,
//     GEO_POINT: 7,
// };

DB.Boolean = TableStore.FieldType.BOOLEAN;
DB.String = TableStore.FieldType.KEYWORD;
DB.Text = TableStore.FieldType.TEXT;
DB.Int = TableStore.FieldType.LONG;
DB.BigInt = TableStore.FieldType.LONG;
DB.Float = TableStore.FieldType.DOUBLE;
DB.KeyWord = TableStore.FieldType.KEYWORD;

module.exports = DB