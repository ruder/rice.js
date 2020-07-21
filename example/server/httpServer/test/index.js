var path = require("path")
var Main = require("./main")

module.exports = {
    main: Main,
    router: path.join(__dirname, "./router/"),
    ots: path.join(__dirname, "./ots/"),
}