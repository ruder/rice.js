
var DB = require("./db")

var dbs = {};
var GET_DB = function (opts) {
    var kys = {};
    ["accessKeyId", "secretAccessKey", "endpoint", "apiVersion","instanceName"].forEach(key => {
        kys[key] = opts[key]
    })
    var key = JSON.stringify(kys).replace(/\s*/ig, "")
    if (!dbs[key])
        dbs[key] = new DB(opts)
    return dbs[key];
}

class OtsPool {
    constructor(opts) {
        this.opts = opts;
        this.instanceName = opts.instanceName;
        //存放表格定义的路径
        this.path = opts.path || "./"; 
        if (this.path.length && this.path[this.path.length - 1] != "/")
            this.path += "/"


        this.db = GET_DB(this.opts)
        this.dic = {};
    }
    getDB(tableName) { 
        var table = this.dic[tableName]
        if (!table) {
            var name = (this.opts.prefix || '') + tableName;
            try {
                var gtConfig = require(this.path + tableName)
            } catch (ex) {
                throw new Error(`${tableName}数据表未定义！`)
            }
            table = this.db.getTable(name, gtConfig(DB));
            this.dic[tableName] = table;
        }
        return table;
    }
}

module.exports = OtsPool

module.exports.init=(ctx, modu, config)=> { 

    if (config.ots) { 
        opts = JSON.parse(JSON.stringify(config.ots));
        opts.path = modu.ots 
        ctx.ots = new OtsPool(opts)
    }
}