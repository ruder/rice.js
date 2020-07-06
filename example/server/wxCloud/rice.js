
const path = require("path")
const fs = require("fs");

let config={
    _: {
        ots: {
            "accessKeyId": "L2T4AIq4laT7F5GdVh",
            "secretAccessKey": "I3sfgerf5geunyuxauAV8MH3FrydEiAIm",
            "endpoint": "https://cn-hangz.ots.aliyuncs.com",
            "apiVersion": "2014-08-08",
            "instanceName": "example",
            "prefix": "",
            "keys": [
                "id"
            ]
        }
    },
    key:"123456",
    miniapp:{
        lib: require("@ruder/miniapp")
    } 
}
 

module.exports = config;
