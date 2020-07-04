# rice.js

后端即前端的Javascript框架。让访问后端跟访问本地一样简单，支持所有javascript运行时，让javascript代码得到最大的复用。


### 访问示例

后端（服务端）代码：

``` javascript

// note/router.js

module.exports={
    async test(user,message){
        return `${user.name} has a message: ${message}`
    }
}

```
前端（客户端）访问代码：

```javascript

let message=await rice.note.test({name:'ruder',sex:'dont know'},'hello')

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
    <td rowspan="6">互通</td>
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
    <td></td>
    <td>微信云函数</td> 
</tr>
</table>

除了微信小程序访问微信云开发的云函数特殊，其它的前后端运行时可以互通

