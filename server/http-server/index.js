var polka = require("polka");
const { json } = require('body-parser');
var compression = require('compression');
const http = require('http'); 

class HttpServer {
    constructor(rice, port) {
        this.rice = rice;
        this.port = port;  
    }
    listen() {
        var port = this.port;
        this.polka = polka({
            onError: function (err, req, res, next) {
                let code = (res.statusCode = err.code || err.status || 500);
                let result = err.length && err || err.message || http.STATUS_CODES[code];
                if (typeof result != "string")
                    result = JSON.stringify(result);
                res.end(result);
            }
        });
        this.polka
            .use(function (req, res, next) {
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
                res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
                res.setHeader("X-Powered-By", ' 3.2.1');
                if (req.method == "OPTIONS") {
                    res.statusCode = 200;
                    res.end();
                }
                else next();
            })
            .use(json({
                limit: 1024 * 1024
            }))
            .use(compression())
            .post((req, res) => {
                res.setHeader('Content-Type', "application/json");
                this.response(req, res);
            })
            .listen(port).then(_ => {
                console.log(`> rice-http-server on localhost:${port}`);
            }).catch(error => {
                console.error('rice-http-server启动失败:', error)
            });
    }
}

module.exports = HttpServer;