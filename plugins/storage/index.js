
var DB = require("./db")

var dbs = {};

var GET_DB = function (opts) {
    var kys = {};
    ["host", "database", "username", "password", "dialect"].forEach(key => {
        kys[key] = opts[key]
    })
    var key = JSON.stringify(kys).replace(/\s*/ig, "")
    if (!dbs[key])
        dbs[key] = new DB(opts)
    return dbs[key];
}

class Storage {
    constructor(opts) {
        this.opts = opts;
        this.path = opts.path || "./";

        if (this.path.length && this.path[this.path.length - 1] != "/")
            this.path += "/"

        this.db = GET_DB(this.opts)
        this.dic = {};
    }



    async getDB(tableName) {
        var db = this.dic[tableName]
        if (!db) {
            var name = (this.opts.prefix || '') + tableName;
            try {
                var gtConfig = require(this.path + tableName)
            } catch (ex) {
                throw new Error(`${tableName}数据表未定义！`)
            }
            db = await this.db.define(name, gtConfig(DB));
            this.dic[tableName] = db;
        }
        return db;
    }
}
module.exports = Storage;
module.exports.init = (ctx, modu, config)=> {
    if (config.storage) { 
        opts = JSON.parse(JSON.stringify(config.storag));
        opts.path = modu.storage 
        ctx.storage = new Storage(opts)
    }
}
