const TableStore = require("tablestore")
class Table{

    constructor(name,client,config){
        this.name=name;
        this.indexName=this.name+"_index"
        this.client=client;
        this.config=config;
 
    }

    async init(){
        // console.log("table.init")
        //判断表是否存在，不存在就建表
        let exist=await this._existTable();
        if(!exist){
            await this._createTable();
            await this._craeteIndex();
            return;
        }
       
        //判断索引是否存在，不存在就建索引
        let _existIndex=await this._existIndex();
        if(!_existIndex)
            await this._craeteIndex(); 
    }

    //查询
    async get(id,columns){
        var params = {
            tableName: this.name,
            primaryKey: [{ 'id': id }], 
        };
        if(columns){
            params.columnsToGet = columns 
        }

        let result = await this._excute("getRow",params) 
        let obj=this._parseObject(result.row) 
        return obj;    
    } 

    async search(where,columns,offset,limit,order){
        let params={
            tableName: this.name,
            indexName: this.indexName,
            searchQuery: {
                offset: offset,
                limit: limit, //如果只为了取行数，但不需要具体数据，可以设置limit=0，即不返回任意一行数据。
                query: this._parseQuery(where),
                getTotalCount: true // 结果中的TotalCount可以表示表中数据的总行数， 默认false不返回
            },
            columnToGet: { //返回列设置：RETURN_SPECIFIED(自定义),RETURN_ALL(所有列),RETURN_NONE(不返回)
                returnType: TableStore.ColumnReturnType.RETURN_ALL
            }
        }

        //返回属性
        if(columns){
            params.columnToGet={
                returnType:TableStore.ColumnReturnType.RETURN_SPECIFIED,
                returnNames:columns
            }
        }

        //排序
        if(order){ 
            let sortOrder = TableStore.SortOrder.SORT_ORDER_ASC
            let column = order;
            //正序
            if(order.startsWith("+")){
                column=column.substr(1)
            }
            //倒序
            else if(order.startsWith("-")){
                column=column.substr(1)
                sortOrder=TableStore.SortOrder.SORT_ORDER_DESC
            }

            if(this.config[column])
                params.sort = {
                    sorters: [
                        {
                            fieldSort: {
                                fieldName: column,
                                order: sortOrder,  
                            }, 
                        }
                    ]
                } 
        }
        
        let data=await this._excute("search",params)

        let result={
            list:[],
            total:data.totalCounts
        }

        data.rows.forEach(d=>{
            result.list.push(this._parseObject(d))
        })
        

        // console.log(result)
        return result;
    }

    async getCount(where){
       
        let params={
            tableName: this.name,
            indexName: this.indexName,
            searchQuery: {
                offset: 0,
                limit: 0, //如果只为了取行数，但不需要具体数据，可以设置limit=0，即不返回任意一行数据。
                query: this._parseQuery(where),
                getTotalCount: true // 结果中的TotalCount可以表示表中数据的总行数， 默认false不返回
            },
            columnToGet: { //返回列设置：RETURN_SPECIFIED(自定义),RETURN_ALL(所有列),RETURN_NONE(不返回)
                returnType: TableStore.ColumnReturnType.RETURN_NONE
            }
        }

        let data=await this._excute("search",params)
        return data.totalCounts
    }

 

    //增加&修改
    async set(id,params){

        var Long = TableStore.Long; 
 
        let attr=[];
        for(let index in params){
            let v=params[index];
            if(this.config[index]==TableStore.FieldType.LONG)
                v=Long.fromNumber(v)
            let o={}
            o[index]=v
            attr.push(o)
        }
        var params = {
            tableName: this.name,
            //不管此行是否已经存在，都会插入新数据，如果之前有会被覆盖。condition的详细使用说明，请参考conditionUpdateRow.js
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: [{ 'id': id }],
            attributeColumns: attr,
            // [
            //     { 'col1': '表格存储' },
            //     //客户端可以自己指定版本号（时间戳）
            //     { 'col2': '2', 'timestamp': currentTimeStamp },
            //     { 'col3': 3.1 },
            //     { 'col4': -0.32 },
            //     { 'col5': Long.fromNumber(123456789) }
            // ],
            returnContent: { returnType: TableStore.ReturnType.NONE }
        }; 

        let result = await this._excute("putRow",params) 
        return result; 

    }

    //删除
    async delete(id){
        var params = {
            tableName: this.name,
            condition: new TableStore.Condition(TableStore.RowExistenceExpectation.IGNORE, null),
            primaryKey: [{ 'id': id }]
        };

        let result = await this._excute("deleteRow",params) 
        return result; 
    }

    async _craeteIndex(){

        let params={
            tableName: this.name,// 设置表名
            indexName: this.indexName,// 设置索引名
            schema: {
                fieldSchemas: []
                // indexSetting: {//optional
                //     "routingFields": ["id"],//仅支持主键
                //     "routingPartitionSize": null
                // }
            }
        }

        for(let index in this.config){
            if(index=="id")
                continue;
            
            let p={
                fieldName: index,
                fieldType: this.config[index],
                index: true,
                // enableSortAndAgg: true,
                store: true,
                // isAnArray: false
            }
            params.schema.fieldSchemas.push(p); 
        }

        let result=await this._excute("createSearchIndex",params)
        // console.log(result);
        return result;

    }

    async _existIndex(){
        try{
            let d=await this._excute("describeSearchIndex",{tableName:this.name, indexName:this.indexName}) 
            // console.log(d);
            return true;
        }
        catch(ex){
            if(ex.message.includes("search index not exist"))
                return false;
            throw ex
        }
    }

    async _createTable(){
        var params = {
            tableMeta: {
              tableName: this.name,
              primaryKey: [
                {
                  name: 'id',
                  type: 'STRING'
                }
              ]
            },
            reservedThroughput: {
                capacityUnit: {
                    read: 0,
                    write: 0
                }
            },
            tableOptions: {
              timeToLive: -1,// 数据的过期时间, 单位秒, -1代表永不过期. 假如设置过期时间为一年, 即为 365 * 24 * 3600.
              maxVersions: 1// 保存的最大版本数, 设置为1即代表每列上最多保存一个版本(保存最新的版本).
            }
          };
          
          let result=await this._excute("createTable",params);
        //   console.log(result);
          return result;
    }

    async _existTable(){
        try{
            let d=await this._excute("describeTable",{tableName:this.name}) 
            // console.log(d);
            return true;
        }
        catch(ex){
            if(ex.message.includes("Requested table does not exist"))
                return false;
            throw ex
        }
    }


    //支持
    //{name:"",year:{$gt:20,$lt:''}}
    //{name:{$in:[]},year:{$gt:20}}
    //还需要支持
    //不等于
    _parseQuery(where){ 

        let query=null; 
 
        if(where["$or"])  query= this._mapQuery(where["$or"],true);
        else query = this._mapQuery(where)

        //返回全部行  
        if(!query) query = { queryType: TableStore.QueryType.MATCH_ALL_QUERY }

        // console.log("query",query)
        return query; 
    }

    _mapQuery(where,or){
        if(!where)
            return null;

        let list=[];
        for(let index in where){
            if(this.config[index])
                list.push({fieldName:index,value:where[index]}) 
        }

        let qs=list.map(o=>{
            let vType=typeof o.value;

            
            if(vType !=="object"){ 
                //前缀查找
                if(o.value.endsWith("%")){
                    return {
                        queryType: TableStore.QueryType.PREFIX_QUERY,
                        query: {
                            fieldName: o.fieldName,
                            prefix: o.value.substr(0,o.value.length-1) //设置前缀，可命中"hangzhou"、"hangzhoushi"等
                        }
                    }
                }
                
                //精准查找
                return {
                    queryType:TableStore.QueryType.TERM_QUERY,
                    query:{
                        fieldName:o.fieldName,
                        term:o.value
                    }
                }
            } 

            let q=o.value;
            //多值查找
            if(q["$in"]){
                return {
                    queryType:TableStore.QueryType.TERMS_QUERY,
                    query:{
                        fieldName:o.fieldName,
                        terms:q["$in"]
                    }
                }
            }
            
            //范围查找
            if( q['$lt'] || q['$lte'] || q['$gt'] || q['$gte']){
                let result={
                    queryType:TableStore.QueryType.RANGE_QUERY,
                    query:{
                        fieldName:o.fieldName,
                        rangeFrom:TableStore.INF_MIN,
                        includeLower:false,
                        rangeTo: TableStore.INF_MAX,
                        includeUpper: false

                    }
                }

                if(q['$gte']){
                    result.query.rangeFrom=q["$gte"]
                    result.query.includeLower=true;
                }
                else if(q['$gt']){
                    result.query.rangeFrom=q["$gt"]
                }

                if(q['$lte']){
                    result.query.rangeTo=q["$lte"]
                    result.query.includeUpper=true;
                }
                else if(q['$lt']){
                    result.query.rangeTo=q["$lt"]
                }

                return result;
            } 

            throw {error:"Error_Query", message:`不支持${JSON.stringify(o)}的查找`}
        })

        if(!qs.length)
            return null;
 
        if(qs.length<=1)
            return qs[0];

        if(!or)
            return{
                queryType: TableStore.QueryType.BOOL_QUERY,
                query: {
                    mustQueries:qs
                }
            }

        return{
            queryType: TableStore.QueryType.BOOL_QUERY,
            query: {
                shouldQueries:qs,
                minimumShouldMatch:1
            }
        }
    }
 
    _parseObject(row){
        // console.log(row)
        if(!row)
            return undefined;
        
        let obj={} 
        row.primaryKey.forEach(o=>{
            obj[o.name]=o.value
        })
        row.attributes.forEach(o=>{
            if(this.config[o.columnName]==TableStore.FieldType.LONG)
                obj[o.columnName]= o.columnValue.toNumber()
            else
                obj[o.columnName]=o.columnValue
        })
        return obj; 
    }

    _excute(key,params){
        return new Promise((resolve,reject)=>{
            this.client[key](params,(error,data)=>{
                if(error)
                    return reject(error)
                resolve(data);
            })
        })
    }
 
}


module.exports=Table