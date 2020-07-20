let path = require("path")
let fs = require("fs")
// let guid = require("ruder-guid")

class Grains {
    constructor() {
        this.dic = {};
        this.grains = {};
        this.routers = {};
        this.configs = {};
        this.inited = false; 
        this.reloading=false; 
        
    }

    init(configPath,plugins) {
        if (this.inited)
            return;
        
        this._plugins=plugins||[];

        this._configPath = configPath;    

        this._loadAllModules(configPath);
        this._initAllModules();
        this._checkRequires();
        this._finishInit();

        this.inited = true;

        this._printModules();
 
    }

    async access(mName, aName, params) { 
        if(this.reloading)
            throw new Error("正在重启服务,请等待!");

        var m = this.grains[mName]
        if (!m)
            throw new Error(`${mName}参数不正确，无法定位到模块！`)
        var router = this.routers[mName]
        if (!router)
            throw new Error(`${mName}参数不正确，无法定位到模块接口！`)
        var action = router[aName];
        if (!action)
            throw new Error(`${aName}参数不正确，无法定位到执行方法！`)

        // console.log(mName, aName, params)
        var result = await action.apply(m, params);
        return result;
    }
    
    async getAllActions() {
        var map = {};
        for (var key in this.routers) {
            map[key] = [];
            var router = this.routers[key];
            for (var name in router)
                map[key].push(name)
        }
        return map;
    }

    require(key) {
        let mo = this.grains[key]
        if (!mo)
            throw new Error(`${key}找不到业务模块，是否未在.rice.js配置？`)
        return mo;
    }

    
    async reload(){

        try{
            this.reloading=true; 
            await this._sleep(5000); 

            //删除所有require
            let caches=require.cache;
            let cacheKeys=Object.keys(caches);
            for(let index in this.dic){
                let key=this.dic[index].config.lib; 
                cacheKeys.forEach(cKey=>{
                    if(cKey.startsWith(key)){
                        delete caches[cKey]
                        console.log(cKey);
                    }
                })
            }
            delete caches[this._configPath]


            //重新加载
            this.dic = {};
            this.grains = {};
            this.routers = {};
            this.configs = {};
            this.inited = false;
            this.init(this._configPath); 
        }
        catch(ex){
            console.error(ex);
            throw ex;
        }
        finally{
            this.reloading=false;
        }

    }

    _sleep(ms){
        return new Promise((resolve,reject)=>{
            setTimeout(resolve,ms);
        })
    }


    _loadAllModules(configPath) {

        let configs = this._loadConfig(configPath);
        this.config = configs._ || {};
        for (var key in configs) {
            //公共的
            if (key === "_" )
                continue;

            var config = configs[key];

            if(typeof config!="object")
                continue

            // 如果没有返回配置文件，则表示
            if (!config)
                return;

            //复用公共配置
            for(let index in config){
                if(!this.config[index])
                    continue;
                
                if(typeof this.config[index]!="object")
                    continue;

                if(typeof config[index] !="object")
                    config[index]={};
                
                config[index]=Object.assign({},this.config[index],config[index])
            }


            let mo = config.lib;
            if (typeof mo === "string"){
                let mpath = config.lib || key;

                try{
                    mo = require(mpath)
                }
                catch(ex){
                    mo={}
                }

                //默认的main
                if(!mo.main)
                    mo.main = require(mpath+"/main.js")
                    
                //默认的router
                if(!mo.router)
                    mo.router = require(mpath+"/router.js")

            }
            if (!mo)
                throw new Error(`模块${key}未载入失败，请使用npm i安装这个模块`);

            this.dic[key] = {
                module: mo,
                config: config
            }
        };
    }
    _loadConfig(configPath) {
        if (typeof configPath !== "string")
            return configPath;
        var filePath = configPath || path.join(path.dirname(require.main.filename), ".rice.js")
        return require(filePath) 
    }

    _initAllModules() {
        for (let index in this.dic) {
            let obj = this.dic[index];
            this._initModule(index, obj.module, obj.config);
        }
    }


    _initModule(key, modu, config) {
        // 创建context, 将 config 里要示的插件都加载好
        let ctx = {
            key: key,
            config: config, // 读取的配置
            require: this.require.bind(this), // 获得其它模块 
        }

        //插件的初始化
        for(let i=0;i<this._plugins.length;i++){
            let plugin = this._plugins[i];
            plugin.init(ctx,modu,config)
        }

        // // 关系数据库
        // this.__initStorage(ctx, modu, config);
        // // 阿里OTS数据库
        // this.__initOTS(ctx, modu, config);

        // 创建实体
        let main = new modu.main(ctx);

        // 加载路由,路由的方法必须全是async 

        if (modu.router) {

            let actions=[];
            //如果是单路由文件
            if(typeof modu.router=="string" && modu.router.endsWith(".js")){
                let action = require(modu.router)
                actions.push(action)
            }
            //如果是路由文件夹
            else if(typeof modu.router=="string" ){
                let routers = fs.readdirSync(modu.router);
                routers.forEach(actionStr => {
                    //路由必须是js文件
                    if(!actionStr.endsWith(".js"))
                        return;
                    let action = require(path.join(modu.router, actionStr))
                    actions.push(action)
                });
            }
            //默认路由对象：/router.js
            else{
                actions.push(modu.router)
            }
 
            actions.forEach(action => { 
                var robjs = action
                if (typeof action !== "object")
                    robjs = action(main)

                this.routers[key] = this.routers[key] || {};
                var nObj = this.routers[key];

                for (var index in robjs) {
                    if (nObj[index])
                        throw new Error(`${key}模块的路由${actionStr}在方法${index}被重复定义！`)
                    if (typeof robjs[index] === "string") {
                        var akey = robjs[index];
                        if (!main[akey])
                            throw new Error(`${key}模块的路由${actionStr}在方法${index}被未定义！`)
                        nObj[index] = main[akey];
                    }
                    else
                        nObj[index] = robjs[index]
                }

                for (var index in robjs) {
                    var ac = robjs[index];
                    if (ac.constructor && ac.constructor.name === "Function") {
                        var errStr = `${key}模块的路由${actionStr}在方法${index}必须是async！`
                        throw new Error(errStr)
                    }
                }
            })
        }

        //设定需求模块
        main.requires = modu.requires

        //设定模块
        this.grains[key] = main;
    }


    _checkRequires() {
        for (var index in this.grains) {
            var mo = this.grains[index];
            if (!mo.requires)
                continue;
            if (!Array.isArray(mo.requires))
                throw new Error(`${index}模板的require必须是数组，数组里是模块的名称！`)
            var requires = mo.requires;
            mo.requires = {};
            requires.forEach(c => {
                var re = this.grains[c];
                if (!re)
                    throw new Error(`${index}模块需求的${c}模块未配置或加载，请检查配置文件里是否有${c}模块的配置。`)
                mo.requires[c] = re;
            });
        }
    }

    _finishInit() {
        for (var index in this.grains) {
            var mo = this.grains[index];
            if (mo.init)
                mo.init.apply(mo);
        }
    }

    // __initStorage(ctx, modu, config) {
    //     if (config.storage) {
    //         let opts = this.config.storage || {};
    //         if (typeof config.storage == "object")
    //             opts = config.storage;

    //         config.storage = opts;
    //         opts = JSON.parse(JSON.stringify(opts));
    //         opts.path = modu.storage

    //         ctx.storage = new Storage(opts)
    //     }
    // }

    // __initOTS(ctx, modu, config) {
    //     if (config.ots) {
    //         let opts = this.config.ots || {};
    //         if (typeof config.ots == "object")
    //             opts = config.ots;

    //         config.ots = opts;
    //         ctx.ots = new OTS(JSON.parse(JSON.stringify(opts)));
    //     }
    // }

    async _printModules() {
        var ms = await this.getAllActions();
        console.log("load module sccuess:")
        for (var index in ms) {
            var list = ms[index];
            console.log(index, list.join(","));
        }
    }


}


module.exports = new Grains();

module.exports.ROOT_PATH = module.filename.replace("grains.js", "");