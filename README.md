# rice.js

后端即前端的Javascript框架。让访问后端跟访问本地一样简单，支持所有javascript和Nodejs运行时，让javascript代码得到最大的复用。


### 代码示例

后端（服务端）代码：

``` javascript

// note/router.js

module.exports = {
    async test(user,message){
        return `${user.name} has a message: ${message}`
    }
}

```
前端（客户端）访问代码：

```javascript

let user = {name:'ruder',sex:'dont know'}

let message = await rice.note.test(user, 'hello')

assert.areEqual(message,'ruder has a message: hello')

```


### 支持的运行时 


<table style="border:solid 1px #ddd">
<tr>
    <td>前端</td>
    <td>前端运行时</td>
    <td>通道</td>
    <td>后端运行时</td>
    <td>后端</td>
</tr>
<tr>
    <td rowspan="7">业务代码</td>
    <td>浏览器、Node、React Native</td>
    <td rowspan="6">-</td>
    <td rowspan="2">云服务器、docker</td>
    <td rowspan="7">业务代码</td>
</tr>
<tr> 
    <td>weex</td>  
</tr>
<tr> 
    <td>uni-app</td> 
    <td rowspan="2">腾讯云函数</td>
</tr>
<tr> 
    <td>微信小程序</td>  
</tr>
<tr> 
    <td>支付小程序</td> 
    <td rowspan="2">阿里函数计算</td>
</tr>
<tr> 
    <td>快应用</td>  
</tr> 
<tr> 
    <td>微信云开发</td>
    <td>-</td>
    <td>微信云函数</td> 
</tr>
</table>

微信云函数比较特殊，只能由微信云开发访问。其它后端运行时均支持其它前端运行时访问。
  
 

## 开发示例

这里列出除了`微信云开发`的其它环境的示例，`微信云开发`示例单列在最后面。

### 服务端代码

这里支持云服务器和docker，也支持阿里和腾讯的云函数。
我们假设客户端需要从服务端获昨一个用户的信息，先定义这个模块名称为`users`，取得信息的方法名叫`getUser`。
我们列出文件结构图：
```
server 
    -- index.js //入口文件
    -- users // users模块
        -- main.js // 模块主文件
        -- router.js // 路由文件，即开放给前端访问的函数
```
先来看`index.js`的示例代码：
```javascript
//index.js
const path = require("path")
const fs = require("fs");
const rice=require("@ricejs/server")
//这里host表示以下服务器运行环境
// @ricejs/host-aliyun-func：阿里函数计算。详细参与 example/server/example/aliyunFunc
// @ricejs/host-qcloud-func：腾讯云函数。详细参与 example/server/example/qcloudFunc
// @ricejs/host-http-server：云服务器，docker  
const httpServer = require("@ricejs/host-http-server")
//配置文件，定义要业务模块及其相关配置
const config={
    key:"123456", // 服务端和客户端通讯的加密key，不设则表示通讯不加密。
    users:{
        lib: path.join(__dirname,"./users"),
        //默认用户
        defaultUser:{
            name:"rice",
            id:0,
            avatarUrl:"http://www.a.com/b.png"
        }
    }
}

rice.init(config) 
new HttpServer(rice,80).listen(); 
```
再来看`users/main.js`的代码
```javascript
//users/main.js
class Main {
    constructor(ctx) {
        this.config = ctx.config; //配置信息 即config.users的内容
    }

    init(){} //模块初始化代码放这里

    //获得用户的openid
    getDefaultUser(){
        //返回配置里定义的默认用户
        return this.config.defaultUser
    } 
    async getUserFromDB(id){
        //这里可以去数据库找用户，这里不演示了
        return null;
    }
}

module.exports = Main;
```
路由文件`users/router.js`定义哪些函数开放给客户端访问：
```javascript
//users/router.js
module.exports = {
    async getUser(id){
        //先在数据库找用户
        let u = await this.getUserFromDB(id);
        if(u)
            return u;
        //如果找不到就返回默认用户 
        return this.getDefaultUser()
    } 
}
```

### 客户端代码

客户端代码支持浏览器、Node、React Native、Weex、支付宝小程序、微信小程序、uni-app、快应用等。因为uni-app可以开发Android、iOS、各家小程序、Web，所以这里就以uni-app作为例子。

先看代码结构
```
client 
    -- rice.js //rice初始化文件
    -- users.js //客户端中的users文件，管理用户的一切
```

先看`rice.js`代码：
```javascript
//rice.js 

//Channel各客户端运行时访问服务端的实现
// @ricejs/client-channel：浏览器、Node、React Native
// @ricejs/client-ap-channel：支付宝小程序
// @ricejs/client-hap-channel：快应用
// @ricejs/client-uni-channel：uni-app
// @ricejs/client-weex-channel：weex
// @ricejs/client-wx-channel：微信小程序(非云开发环境) 
let Channel = require("@ricejs/client-uni-channel")
let Rice = require("@ricejs/client")
   
//通讯加密key，不设则表示请求不加密。必须同服务端一致。
let key="123456"
let rice = Rice.create(new Channel("http://localhost:80"),key)
 
module.exports = rice;
```
再看客户端的`users.js`
```javascript
//users.js

const rice=require("./rice")

class Users{
    async get(id){
        //使用rice，非常方便地访问服务端的`users/router.js`的方法`getUser`
        let u=await rice.users.getUser(id);
        reutrn u;
    }
}

module.exports=Users

``` 



## 微信小程序云开发示例

有一个环境比较特殊，就是微信小程序的云开发，客户端和服务端都是定制，无法跟其它共享。
 
#### 服务端代码

服务端的代码结构
```
server
    -- index.js
    -- test
        -- main.js
        -- router.js
```

在云函数的`index.js`下的代码：
```javascript
//index.js
 
const path = require("path")
const fs = require("fs");
const rice=require("@ricejs/server")
const wxCloud=require("@ricejs/host-wx-cloud")
const config={
    test:{
        lib: path.join(__dirname,"./test"),
    }
}

rice.init(config)
module.exports=new wxCloud(rice);
```
服务端模块`test`有两个文件，`main.js`是模块主文件，`router.js`是路由文件，开放给前端访问的。
先看`main.js`的代码：
```javascript
//test/main.js
const cloud = require('wx-server-sdk')
class Main {
    constructor(ctx) {
        this.config = ctx.config; //配置信息 即config.test的内容
    }

    init(){} //模块初始化代码放这里

    //获得用户的openid
    getOpenid(){
        const wxContext = cloud.getWXContext()
        return wxContext.OPENID
    } 
}

module.exports = Main;
```
再看路由文件`router.js`的代码：
```javascript
//test/router.js
module.exports = {
  async login(){ 
      return {
        openid:this.getOpenid() //这里的this，就是模块主文件main对象
      }
  } 
}
``` 


#### 客户端代码：

同样，列出代码结构：
```
client
    -- rice.js
    -- app.js
    -- pages
        -- login
            -- index.js
```

1，新建`rice.js`
```javascript
//rice.js 

let Channel = require("@ricejs/client-wx-cloud-channel")
let Rice = require("@ricejs/client")
  
let rice = Rice.create( new Channel(
    "rice", //这是云函数名称
    "default-db14325" //这是云开发环境Id。如果只有一个环境可以不填写
    ))
 
module.exports = rice;
```
2，在`app.js`更改`onLaunch`:
```javascript
//App.js  
import rice from "./rice"
App({
    onLaunch: function () { 
        rice.wait();
        this.rice=rice; 
    }
})

```
3，在pages中的`pages/login/index.js`就可以这样使用：

```javascript
//pages/login/index.js
const app = getApp()
Page({
    data: {}, 
    onLoad: function() { 
        app.rice.test.login().then(d=>{
            console.log(d);
        })
    }
});
```