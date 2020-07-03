
var DB = require("ruder-ots")

var dbs = {};
var GET_DB = function (opts) {
    var kys = {};
    ["accessKeyId", "secretAccessKey", "endpoint", "apiVersion"].forEach(key => {
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
        this.db = GET_DB(this.opts)
        this.dic = {};
    }
    getDB(tableName) {
        var name = (this.opts.prefix || '') + tableName;
        var db = this.dic[name]
        if (!db) {
            db = new DB({ ots: this.db.ots.ots }, this.instanceName, name, this.opts.keys || ["id"]);
            this.dic[name] = db;
        }
        return db;
    }
}

module.exports = OtsPool

module.exports.init=(ctx, modu, config)=> {
    if (config.ots) {
        let opts = this.config.ots || {};
        if (typeof config.ots == "object")
            opts = config.ots;

        config.ots = opts;
        ctx.ots = new OtsPool(JSON.parse(JSON.stringify(opts)));
    }
}