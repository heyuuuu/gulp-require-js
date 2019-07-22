# gulp-require-module-js

基于gulp做功能模块引入加载，适用于管理公共代码。

## 什么是 gulp-require-module-js

在古老的项目中，如果你们的项目基于gulp构建处理，多个js文件中存在公共的代码，阔以将公共的函数提取到一个js文件中管理。

这里不同于Module加载方式，我们并没有做代码切割，而只是做了代码引入处理。

如果你不想去配置 es6 + cmd加载模式，那么可以这个管道函数。

## 如何使用这个管道函数，该如何配置它？

```
    debug   : false,
    fileReg : /^[\B\n]?\$import\(['"](.*)['"]\)/gi,
    alias   : {}
```
这里我们提供了三个配置
> * debug: 开启所有构建详细信息
> * fileReg: 如何去匹配我们需要引入的公共js文件，注意：这里我的使用的是相对路径引入
```
    $import('./a.js');
```
> * alias: 为模块配置别名，也阔以配置公共路径
```
    // 假如我们的公共函数存在/a/b/c.js这个文件之中，那么我们在需要它的其他js中这样配置
    alias:{'/a/b/c.js':'$c'}
    // 或者使用正则替换
    alias:{'/a/b/c.js':/\B\$c\b/g}
    // 在需要的其他js文件中这样引入
    $import('$c');
```

## 使用该管道插件的初衷

在老的项目中，由于存在大量不严格写法，导致无法使用es6的Module语法，为了以后做技术迭代，个人开发了该插件。
```
    我们的目录结构
    |—— src
        |—— a.js
        |—— b.js
        |—— c.js

    a.js是抽离的公共代码，我这里使用es6语法
    var A_module = (function(win){
        function test(){
            console.log("hello word!");
        };
        return { test };
    })(window);

    b.js中这样引入
    $import('./a.js');
    // 也阔以这样引入
    $import('/src/a.js');
    const { test } = A_module;
    test();

    如果在alias中配置了alias:{'/src/a.js':/\B\$AModule\b/g}，我们可以在c.js中这样使用
    $import('$Amodule');
    const { test } = A_module;
    test();
    // 这里需要注意: 如果c.js中引入b.js那么也阔以直接使用test()。

```

## 疑问？

为什么我们要使用，这种自执行函数，第一避免全局污染，第二，以后使用Module语法也容易重构

```
    var A_module = (function(win){
        function test(){
            console.log("hello word!");
        };
        return { test };
    })(window);

    使用es6的Module语法:
    function test(){
        console.log("hello word!");
    };
    export { test };

    // 在引入的时候，如果你设置了alias别名，那么在webpack中构建的时候就要配置相应的别名
    import { test } form '$c';
```