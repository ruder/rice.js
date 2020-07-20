If you want to access `B rice Server`，but your client cant't access it。

If your client can access `A rice server`, let `A rice server` make a proxy, help your client to access `B rice server`



### Server

`A rice server` rice.js config add this：
```javascript
{
    _:{},
    proxy:{
        lib:"@ricejs/proxy"
    }
}
```


### Client

```javascript
const Proxy=require("@ricejs/proxy/client") 

// when you get A rice client
let arice = getArice();
let bRiceServerUrl="https://some.com/abc";
new Proxy(arice,bRiceServerUrl,{
    'minie':[ //bRiceServer moudle name
        'get',//router method name
        'set',//router method name
    ]
})

```
Now your cant access b rice server method like this:

```javascript 

let result = await arice.minie.get("a")

```