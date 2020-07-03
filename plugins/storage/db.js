var Sequelize = require("sequelize");

class DataBase {
    constructor(config) {
        this.sequelize = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: config.dialect,
            pool: {
                max: 5,
                min: 1,
                idle: 10000
            },
            logging: !config.logging,
            charset: "utf-8",
            // operatorsAliases: false,
            define: {
                // timestamps: false
            }
        });
    }

    async define(name, config) {
        var result = await this._initModel(this.sequelize.define(name, config));
        return result;
    }
    parseComparison(value) {
        if (value.startsWith('>=')) {
            return {
                [Sequelize.Op.gte]: value.replace('>=', '')
            }
        }
        if (value.startsWith('>')) {
            return {
                [Sequelize.Op.gt]: value.replace('>', '')
            }
        }
        if (value.startsWith('<=')) {
            return {
                [Sequelize.Op.lte]: value.replace('<=', '')
            }
        }
        if (value.startsWith('<')) {
            return {
                [Sequelize.Op.lt]: value.replace('<', '')
            }
        }
    }
    parseComparisons(value) {
        if (typeof value !== "string") return value
        // 只有一个条件比较或没有比较
        if (!value.includes(' && ')) {
            return this.parseComparison(value) || value
        }

        let values = value.split(' && ')
        let comparers = values.map(value => this.parseComparison(value))
        return Object.assign({}, ...comparers)
    }

    checkId(obj) {
        if (!obj)
            return obj;
        obj.id = obj.id + "";

        return obj;
    }
    async _initModel(model) {

        var supThat = this;
        model.get = function (id, columns) {
            var that = this;
            return new Promise((resolve, reject) => {

                that.find({ where: { id: id }, attributes: columns }).then(function (obj) {
                    var result = obj;
                    if (obj)
                        result = obj.dataValues;
                    resolve(result);
                }).catch(e => reject(e));

            })
        };

        model.searchOne = function (where, columns) {
            var that = this;
            return new Promise((resolve, reject) => {

                that.find({ where: where, attributes: columns }).then(function (obj) {
                    var result = obj;
                    if (obj)
                        result = obj.dataValues;
                    resolve(result);
                }).catch(e => reject(e));

            })
        };
        model.parseWhere = function (where) {
            for (var index in where) {
                var v = where[index];
                if (v && v.indexOf && v.indexOf("%") >= 0)
                    where[index] = {
                        [Sequelize.Op.like]: v
                    }
            }

            for (const key in where) {
                if (!where[key]) { // 搜索空值
                    where[key] = {
                        [Sequelize.Op.or]: [null, '']
                    }
                } else if (typeof where[key] === "string") {
                    // 或查询: 原value: 'a || b', 用‘ || ’分割
                    let ors = where[key].split(' || ')
                    // 如果要搜索空值就同时搜索null，例: 'a || ' // ['a', '', null]
                    if (ors.includes('')) {
                        ors.push(null)
                    }
                    if (ors.length >= 2) {
                        where[key] = {
                            [Sequelize.Op.or]: ors
                        }
                    }

                    where[key] = supThat.parseComparisons(where[key])
                }
            }

            // 同时搜索多个字段, 例: {'name || phone': '1234'}
            for (const key in where) {
                if (key.includes(' || ')) {
                    let value = where[key]
                    delete where[key]
                    let keys = key.split(' || ')

                    let wheres = {
                        [Sequelize.Op.or]: keys.map(key => Object.assign({
                            [key]: value
                        }, where))
                    }
                    where = wheres
                }
            }
            return where;
        }
        model.search = function (where, columns, offset, limit, order) {
            var that = this;
            where = this.parseWhere(where);

            return new Promise((resolve, reject) => {

                that.findAll({ where: where, attributes: columns, offset: offset, limit: limit, order: order }).then(function (obj) {
                    resolve(obj.map(c => c.dataValues));
                }).catch(e => reject(e));

            })
        };

        model.distinct = async function (where, column) {

            var list = await this.findAll({
                where: this.parseWhere(where),
                attributes: [
                    [Sequelize.literal('distinct `' + column + '`'), column]
                ]
            });

            var result = [];
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    let key = list[i].dataValues;
                    result.push(key[column]);
                }
            }
            return result;
        }
        model.getCount = async function (where) {
            var list = await this.findAll({
                where: this.parseWhere(where),
                attributes: [
                    [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
                ]
            });

            var count = list[0].dataValues.count;
            return count;
        }

        model.delete = function (id) {

            var that = this;
            return new Promise((resolve, reject) => {
                that.destroy({ where: { id: id } }).then(function (obj) {
                    resolve();
                }).catch(e => reject(e));
            });
        };

        model.deleteWhere = function (where) {
            var values = [];
            for (var index in where) {
                if (where[index])
                    values.push(where[index])
            }
            if (!values.length)
                throw new Error("can't delete all data");

            var that = this;
            return new Promise((resolve, reject) => {
                that.destroy({ where: where }).then(function (obj) {
                    resolve();
                }).catch(e => reject(e));
            });
        };

        model.save = function (obj) {
            var that = this;
            return new Promise((resolve, reject) => {
                // insert
                if (!obj.id) {
                    that.create(obj).then(function (obj) {
                        resolve(obj.dataValues);
                    }).catch(e => reject(e));
                    return;
                }

                // update
                that._update(obj, { where: { id: obj.id } }).then(function (obj) {
                    resolve(obj)
                }).catch(e => reject(e));
            });
        };
        model.store = model.save;

        model.insert = function (obj) {
            var that = this;
            return new Promise((resolve, reject) => {

                that.create(obj).then(function (obj) {
                    resolve(obj.dataValues);
                }).catch(e => reject(e));

            });
        };

        model._update = model.update;
        model.update = function (obj, parms) {

            var that = this;
            return new Promise((resolve, reject) => {
                var sobj = {};
                for (var i = 0; i < parms.length; i++) {
                    var key = parms[i];
                    sobj[key] = obj[key];
                }
                that._update(sobj, { where: { id: obj.id } }).then(function (obj) {
                    resolve(obj);
                }).catch(e => reject(e));
            });
        };

        model.Op = Sequelize.Op;

        await model.sync();

        return model;
    }
}

DataBase.Boolean = Sequelize.BOOLEAN;
DataBase.String = Sequelize.STRING;
DataBase.Text = Sequelize.TEXT;
DataBase.Int = Sequelize.INTEGER;
DataBase.BigInt = Sequelize.BIGINT;
DataBase.Float = Sequelize.FLOAT;
DataBase.DateTime = Sequelize.DATE;
DataBase.fn = Sequelize.fn;
DataBase.col = Sequelize.col;
DataBase.literal = Sequelize.literal;
DataBase.Op = Sequelize.Op;

module.exports = DataBase;
