EDP很重要的一个功能就是通过`edp build`来构建项目。在[构建过程](Build#%E6%9E%84%E5%BB%BA%E8%BF%87%E7%A8%8B)中，`处理`阶段，对资源的处理主要由一个或多个Processor完成。Processor直接是链式的串行处理过程，每个Processor处理的是上一个Processor处理后的结果。

本文主要介绍EDP内置的Processors的一些用法，以及如何自定义自己的Processor。

### 目录

* [文件选择](#%E6%96%87%E4%BB%B6%E9%80%89%E6%8B%A9)
* [Builtin Processor](#builtin-processor)
    * [LessCompiler](#lesscompiler)
    * [StylusCompiler](#styluscompiler)
    * [CssCompressor](#csscompressor)
    * [JsCompressor](#jscompressor)
    * [ModuleCompiler](#modulecompiler)
    * [PathMapper](#pathmapper)
    * [TplMerge](#tplmerge)
    * [AddCopyright](#addcopyright)
    * [VariableSubstitution](#variablesubstitution)
    * [MD5Renamer](#md5renamer)
    * [OutputCleaner](#outputcleaner)
* [Custom Processor](#custom-processor)
	* [Processor的运行过程](#processor%E7%9A%84%E8%BF%90%E8%A1%8C%E8%BF%87%E7%A8%8B)
	* [通过Object自定义processor](#%E9%80%9A%E8%BF%87object%E8%87%AA%E5%AE%9A%E4%B9%89processor)
	* [从AbstractProcessor继承自定义processor](#%E4%BB%8Eabstractprocessor%E7%BB%A7%E6%89%BF%E8%87%AA%E5%AE%9A%E4%B9%89processor)

### 文件选择

在`输入`阶段，`edp build`会扫描项目中的所有文件，然后根据`配置文件`中定义的`exports.exclude`过滤掉不需要的文件，剩下的文件集合我们称作`BUILD_FILES`。

在`处理`阶段，每个`Processor`在执行之前，需要从`BUILD_FILES`中选出它需要处理的文件。完成文件选择后，`Processor`将对`PROCESS_FILES`中的每个文件进行处理。

`Processor`的文件选择方法如下：

#### files属性

该属性从 **1.0.0版本** 开始引入。

通过`Processor`的`files`参数可以为`Processor`选择需要处理的文件。每个`Processor`都支持`files`，其是一个`Array`，其中每一项是一个符合glob规则的`pattern string`。后续的各个`Processor`介绍将不再对`files`参数进行说明。

每个`Processor`在开始处理前，其要处理的文件是一个`空集`，我们称作`PROCESS_FILES`。通过`files`的每一项`pattern` **按顺序** 选择文件。

- 如果`pattern`不以`!`开头，从`BUILD_FILES`中选出符合该`pattern`的文件放入`PROCESS_FILES`
- 如果`pattern`以`!`开头，从`PROCESS_FILES`中将符合该`pattern`的文件排除

```javascript
new LessCompiler({
    files: [
        '*.less',
        '!test/**/*.less'
    ]
})
```


### Builtin Processor

EDP内置了一些常用的`Processors`，基本能够满足前端项目的构建。


#### LessCompiler

编译`less`文件，并对其他文件中`less`资源的引用替换成`css`。具体有：

1. \*.less编译为\*.css
2. entryExtnames指定的那些文件，把`<link href="*.less">`替换为`<link href="*.css">`
3. \*.js中通过插件引用\*.less的地方修改为\*.css

```
new LessCompiler({
    files: [ '*.less' ],
    entryExtnames: 'html,php,tpl'
});
```


下面是`LessCompiler`的参数说明：

##### compileOptions

`Object`。less编译参数，默认值为：

```
{
    paths: [ less file's directory ],
    relativeUrls: true
}
```

如果想要输出的css是压缩之后的，可以添加参数`{ compress: true }`即可，一定程度上可以代替`CssCompressor`的功能.

##### entryFiles

`Array.<string>`，less入口文件选择，规则与`files`相同。 **默认值** 是：

```javascript
[ 
    '*.html', 
    '*.htm', 
    '*.phtml',
    '*.tpl',
    '*.vm',
    '*.js' 
]
```

被匹配上的文件被称为less入口文件。`LessCompiler`将自动扫描里面对`less`资源的引用，替换成`css`。

##### files

`Array.<string>`，**默认值**是`[ '*.less' ]`


##### less

`Object`，自定义的`less`模块。

`edp-build`有自己依赖的`less`版本，如果不想使用该版本，可以自己提供一个`less`模块：

```
new LessCompiler({
  less: require( "./tools/less" )
})
```

#### StylusCompiler

StylusCompiler的功能跟LessCompiler类似。编译`styl`文件，并对其他文件中`styl`资源的引用替换成`css`。

1. \*.styl编译为\*.css
2. entryExtnames指定的那些文件，把`<link href="*.styl">`替换为`<link href="*.css">`
3. \*.js中通过插件引用\*.styl的地方修改为\*.css


```
new StylusCompiler({
    files: [ '*.styl' ],
    entryExtnames: 'html,php,tpl'
});
```

下面是`StylusCompiler`的参数说明：

##### compileOptions

`Object`，stylus编译参数，默认值为：

```
{
    paths: [ stylus file's directory ],
    pathname: 'stylus file's fullpath',
    use: this.compileOptions
}
```

如果想要输出的css是压缩之后的，可以添加参数`{ compress: true }`即可，一定程度上可以代替`CssCompressor`的功能.

##### entryFiles

请参考`LessCompiler`的`entryFiles`参数说明。


##### files

请参考`LessCompiler`的`files`参数说明。

##### stylus

`Object`，自定义的`stylus`模块。

`edp-build`有自己依赖的`stylus`版本，如果不想使用该版本，可以自己提供一个`stylus`模块。使用方式参考`LessCompiler`。


#### CssCompressor

对`css`资源进行压缩。`edp-build`使用的css压缩工具是`clean-css`。

```
new CssCompressor({
    files: [ '*.css', '*.less' ]
});
```

下面是`CssCompressor`的参数说明：

##### compressOptions

`Object`，`clean-css`的压缩参数，默认值为：

```
{
    "noAdvanced": true,  // clean-css的优化模式某些情况下存在问题，默认禁用
    "keepBreaks": true,  // 不压缩成一行
    "relativeTo": css file's directory
}
```

如果想了解`clean-css`还支持哪些参数，可以查看[clean-css的参数说明](https://github.com/GoalSmashers/clean-css#how-to-use-clean-css-programmatically)。

#### files

`Array.<string>`，**默认值**是`[ '*.css' ]`。

#### JsCompressor

对`js`资源进行压缩。`edp-build`使用的js压缩工具是`uglifyjs2`。默认只处理`*.js`文件。

```
new JsCompressor({
    files: [ '*.js', '*.coffee' ]
});
```

下面是`JsCompressor`的参数说明：

#### files

`Array.<string>`，**默认值**是`[ '*.js' ]`。

##### compressOptions

`Object`，压缩选项，默认值是：`{ "warnings": false, "conditionals": false }`。详细信息请参考[uglifyjs2 compress options](http://lisperator.net/uglifyjs/compress)

##### mangleOptions

`Object`，默认值是：`{ "except": [ 'require', 'exports', 'module' ] }`，也就是给变量重命名的时候，忽略这三个变量名。


##### sourceMapOptions

`Object`，<del>现在不建议使用，功能支持的不完善</del>


#### ModuleCompiler

编译AMD模块。主要是将匿名模块具名化，并根据配置和依赖进行模块合并。默认只处理`*.js`。

`ModuleCompiler`的处理需要一个模块配置文件，该模块配置文件必须是一个JSON文件，详情请参见`configFile`配置项说明。

注意：如果最终发布的代码不需要对代码进行合并，那么就没有必要将匿名模块具名化，因此也无需使用`ModuleCompiler`。

```
new ModuleCompiler({
    configFile: 'my-module.conf'
});
```

下面是`ModuleCompiler`的参数说明：

##### files

`Array.<string>`，**默认值**是`[ '*.js' ]`。

##### configFile

模块配置文件，默认为`module.conf`。配置文件是一个`JSON`文件，允许包含以下属性：

- `{string}``baseUrl` - 模块查找的根路径，相对于配置文件所在目录。
- `{Object}``paths` - 特殊模块查找路径，相对于`baseUrl`
- `{Array.<Object>}``packages` - 包引入配置，其中每个包配置`location`项的路径相对于`baseUrl`
- `{Object}``combine` - 需要合并的模块，其中key为模块id，value为`{boolean}`或`Object`。

`baseUrl`、`paths`、`packages`配置项为AMD标准配置项，详细说明请参考[AMD Common Config](https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md)或[ESL的配置文档](https://github.com/ecomfe/esl/blob/master/doc/config.md)

##### getCombineConfig

`function(Object=):Object`，接收一个`Object`，返回值是`Object`类型。ModuleCompiler在读取**合并模块配置项**的时候，主要参考两个地方：

1. `module.conf`文件中的`combine`字段
2. `getCombineConfig`函数的返回值

当我们发现配置了`getCombineConfig`之后，就会调用这个函数，传递的参数是`module.conf`中`combine`字段的值。

---

##### 常见模块合并场景的配置方法

当我们想要合并一些文件的时候，是以Module Id的维度来声明的。例如，当我们想要合并`src/common/main.js`中的代码，那么可以简单的在`module.conf`中配置：

```
{
    "combine": {
        "common/main": true
    }
}
```
合并的过程是递归处理的，也就是先找到`common/main`的一级依赖，把这些依赖的代码合并进来，然后再找二级依赖，三级依赖等等，最终把`common/main`所有的依赖都合并进来。

```
....
....

define( "common/main", function( require ) {
    ...
    ...
})
```

---

当我们在合并的过程中想要排除一些模块的时候，可以使用`modules`，例如：

```
{
    "combine": {
        "common/main": {
            "modules": [ "!~er" ]
        }
    }
}
```
也就是虽然`common/main`最终可能依赖了`er`的代码，但是不要合并进来，而是需要的时候再去按需加载。

---

当我们在合并的过程中想要显式的加入一些模块的时候，可以使用`modules`，例如：

```
{
    "combine": {
        "common/main": {
            "modules": [ "~esui" ]
        }
    }
}
```
也就是虽然`common/main`没有直接依赖`esui`的代码，但是在将来的某个时刻可能会用到，那么就先合并进来，这样子后续使用的时候就不需要重新去加载了。

#### PathMapper

对最终输出的文件路径进行一些改动。主要是基于如下两个方面的考虑：

1. 项目中源码主要放在`src`目录，如果我们最终输出的代码里面还是保留`src`目录，就看起来很不正式
2. 对最终输出的路径进行一些改动，可以一定程度上降低因为浏览器或者CDN缓存导致没有获取最新资源的问题

PathMapper一般做为最后一个Processor。

下面是`PathMapper`的参数说明：


##### from

`string`，**默认值**是`src`，用来设置替换的源路径，一般都是配置成：`{ "from": "src" }`。

##### to

`string`，**默认值**是`asset`，用来设置替换的目标路径，一般都是配置成：`{ "to": "asset" }`。

有时候，我们希望多版本并存，以前的版本能够被保留，可以配置成：

```
// SvnRevision函数请自己实现
{ 
    "to": "asset-" + SvnRevision()
}
```

##### mapper

`function(string):string`，路径映射函数。可以理解为是加强版的from和to，如果单纯的配置`from`和`to`无法满足需求的话，可以配置mapper。

```javascript
new PathMapper({
    mapper: function( value ) { 
        return value.replace( from, to ) 
    }
});
```

##### replacements

`Array.<Object>`，用于指定路径替换后相应资源的引用替换，比如将`html`中的`img`标签里`src`属性为`src/img`的替换成`asset/img`。replacements的默认值如下：

```
replacements: [
    { type: 'html', tag: 'link', attribute: 'href', extnames: pageEntries },
    { type: 'html', tag: 'img', attribute: 'src', extnames: pageEntries },
    { type: 'html', tag: 'script', attribute: 'src', extnames: pageEntries },
    { extnames: 'html', replacer: 'module-config' },
    { extnames: 'less,css', replacer: 'css' }
]
```

前面三条规则应该可以猜出是什么意思，这里就不解释了；第四条规则指的是替换*.html中`require.config`的配置，比如把：`{ "baseUrl": "src" }`替换为`{ "baseUrl": "asset" }`；第五条规则是替换所有css文件中引用图片的路径。

替换的时候只是替换相对路径的引用，如果路径是远程的资源，比如`http://`, `https://`, `//`就不会处理，也不应该处理。

#### TplMerge

这个Processor的作用是合并项目中出现过的模板资源，这样子在发布状态下就会尽可能的减少模板的请求。

下面是`TplMerge`的参数说明：

##### files

`Array.<string>`，**默认值**是`[ 'src/**/*.js' ]`。

##### pluginIds

`Array.<string>`，**默认值**是`[ 'tpl', 'er/tpl' ]`，数组中的每一项都是一个模板插件的Id，如果你的项目中模板插件的Id没有被包含在里面，那么就需要配置这个参数。

##### configFile

`string`，**默认值**是`module.conf`。详细请参考`ModuleCompiler`的`configFile`。

##### outputType

`string`，如果想要把合并之后的模板输出为一个AMD的模块，那么请把这个参数的值设置为`js`，设置其它的值是不接受的。

##### outputPluginId

`string`。

如果合并之后，如果想要把合并之后的模板输出为一个AMD的模块，那么请把这个参数值设置为一个模板插件的Id，例如`jstpl`。因为使用`xhr`的方式加载模板的插件跟使用`require`的方式来加载模板的插件应该是不一样的，所以需要单独设置一下这个参数的值。

注意：`outputType`和`outputPluginId`必须同时设置才会有效，否则没有效果。

如果我们把最终合并的模板输出为一个AMD的模块，那么就可以把模板也部署到Cookieless Domain下面了，不再受限于xhr的跨域问题的限制。

注意：如果需要输出为AMD的模块，那么主要的工作是由`html2js`这个npm package来完成的，因此TplMerge在一定程度上完成了Html2JsCompiler的工作。


#### AddCopyright

给最终输出的文件头部添加一个版权声明。

默认给`css`、`less`、`js`文件添加版权声明。即`files`的默认值为`['*.css', '*.less', '*.js']`。

如果在`构建配置文件`（通常为`edp-build-config.js`）同级目录下存在`copyright.txt`文件，则版权声明以该文件内容为准。否则将使用默认的版权声明信息：

```
'/*! ' + new Date().getFullYear() + ' Baidu Inc. All Rights Reserved */\n'
```

#### VariableSubstitution

将文本文件里`{edp-variable:{variableName}}`相应部分替换成相应`variableName`的值。通常用于为页面的资源引用附加版本号。

```javascript
new VariableSubstitution({
    files: ['*.html'],
    variables: {
        version: '1.0.0'
    }
});

/* 
html里：
<link rel="stylesheet" href="main.css?{edp-variable:{version}}">
会被替换成：
<link rel="stylesheet" href="main.css?1.0.0">
*/
```


下面是`VariableSubstitution`的参数说明：

##### variables

`Object`，用于声明各个变量的值。


#### MD5Renamer

将静态文件根据`MD5`摘要命名，并且替换html和css中对该资源的引用地址。

以`MD5`命名通常有利于浏览器缓存，甚至可以在HTTP头声明该资源永久缓存。`MD5Renamer`将生成一个内容完全相同，名称为`MD5`摘要的文件。原文件将保留，不做删除。

`MD5Renamer`通常放在Processor链的倒数第二的位置，`PathMapper`前。

```javascript
new MD5Renamer( {
    files: [ 
        "src/common/css/main.less"
    ],
    replacements: {
        html: [
            "index.html"
        ]
    }
} )
```

下面是`MD5Renamer`的参数说明：

##### replacements

`Object`，要替换的资源配置。该对象只支持`html`和`css`两个属性，分别是`Array.<string>`。

不同类型的资源，将进行不同的替换：

- 对于`html`，替换script的src、img的src、link的href
- 对于`css`，只替换url()

对非`files`中匹配的资源的引用，将不做替换。上面的例子中，只有对main.less的引用会被替换，ui.less的引用不会被替换。

#### OutputCleaner

如果观察最终输出的`output`目录中的文件，你可能会发现可能存在一些完全用不到的文件，例如`*.less`，`*.styl`，如果你想进一步优化的输出的内容，可以使用这个Processor来删除一些明确不需要的文件。

下面是`OutputCleaner`的参数说明：

##### files

`Array.<string>`，**默认值**是：`[ '*.less', '*.styl', '*.ts', '*.coffee' ]`

### Custom Processor


有时，内置的Processor没法满足我们的需求。EDP BUILD的`配置文件`是一个`node module`。我们可以很灵活的在`配置文件`中自定义自己的Processor。在下面的章节里，我们简单介绍了`Processor的运行过程`，然后提供了`通过Object自定义processor`和`从AbstractProcessor继承自定义processor`的例子


#### Processor的运行过程

[构建过程](Build#%E6%9E%84%E5%BB%BA%E8%BF%87%E7%A8%8B)中，构建主模块通过`Processor`的实例方法`start(processContext, callback)`，与`Processor`发生交互。`Processor`执行完成后，调用由构建主模块传入的`callback`，通知主模块当前`Processor`处理已经完成。

`Processor`的`start`方法做三件事情：

1. 调用实例方法`beforeAll(processContext)`。该方法默认实现为`根据files属性选取当前processor要处理的文件集`
2. 根据选取的文件集，挨个调用实例方法`process(file, processContext, callback)`
3. 调用实例方法`afterAll(processContext)`。该方法默认不做任何事情，需要后续处理的processor可以实现该方法

大多数情况下，自定义自己的Processor都是为了对文件内容做一些自己的处理，这时候只需要重写process方法。我们来看看`process`方法的参数：

##### file

`FileInfo`。EDP Build在读入文件时，会把文件包装成`FileInfo`对象，你可以通过`setData`方法更改数据内容。最后，EDP Build会根据这个`FileInfo`对象的状态进行输出。

该对象包含以下属性：

- data - 文件数据，文本文件时data为`string`，二进制文件时data为`Buffer`
- extname - 文件扩展名
- path - 文件路径，相对于构建目录
- fullPath - 文件完整路径
- fileEncoding - 文件的文本编码类型
- outputPath - 输出路径，修改此项可以更改文件输出目标

##### processContext

`ProcessContext`。构建处理运行时，该对象包含一些运行的基本环境信息。

- baseDir - 构建基础目录
- exclude - 构建排除文件列表
- outputDir - 构建输出目录
- fileEncodings - 文件编码表

##### callback

`function`。当前文件处理完成的回调函数。

由于处理过程可能是异步的（比如less只提供了异步编译接口），所以，处理完成后需要手工调用`callback`，告诉EDP`当前文件的处理已经完成`。

#### 通过Object自定义processor

下面，我们通过编写一个简单的`StringReplacer`，介绍了如何自定义自己的processor：

##### 只需要一步：在getProcessor方法中，使用`JS plain Object`

`getProcessors`方法返回的是处理器实例数组。如果其中的项是一个`JS plain Object`，构建主模块会自动让其具有默认的行为。

自定义Processor的Object中，我们必须包含`name`项，EDP在输出当前Build的过程时，会用到这个属性。我们可以根据自己的需求，选择复写`start`、`process`、`beforeAll`、`afterAll`。

```javascript
exports.getProcessors = function () {
    return [
        new LessCompiler({
            // ...
        }),
        new CssCompressor({
            // ...
        }),
        // 通过`JS plain Object`自定义processor
        {
            files: [ 'index.html' ],
            from: 'oldvalue',
            to: 'newvalue',
            name: 'StringReplacer',
            process: function (file, processContext, callback) {
                if (this.from && this.to) {
                    file.setData(
                        file.data.replace(from, to)
                    );
                }

                callback();
            }
        }
    ];
};
```

至此，我们已经完成了`StringReplacer`的开发和使用。

#### 从AbstractProcessor继承自定义processor

和上面的章节一样，下面通过编写一个简单的`StringReplacer`，介绍了如何自定义自己的Processor：

##### 第一步：写一个类，并继承于AbstractProcessor

`配置文件`被EDP加载后，将通过`injectProcessor`方法往配置模块的`global`中注入`内置Processors`，其中包含了processor的抽象类`AbstractProcessor`。我们需要编写自己的Processor类，并通过原型继承的方式，从`AbstractProcessor`继承。

```javascript
function defineStringReplacer() {
    function StringReplacer(options) {
        AbstractProcessor.call(this, options);
    }

    StringReplacer.prototype = new AbstractProcessor();
    StringReplacer.prototype.name = 'StringReplacer';
    return StringReplacer;
}
```

我们需要为自己的Processor指定一个name，EDP在输出当前Build的过程时，会用到这个属性。

注意：由于EDP在加载完`配置模块`后，才会进行`内置Processors`注入，所以直接在配置模块的下编写Processor类并继承会失败，因为这时`AbstractProcessor`还没有被注入。所以Processor类应编写在一个function内，并在未来执行（见第三步）。

##### 第二步：编写process方法

我们可以根据自己的需求，选择复写`start`、`process`、`beforeAll`、`afterAll`。在当前场景下，我们只需要编写`process`方法：

```javascript
function defineStringReplacer() {
    function StringReplacer(options) {
        AbstractProcessor.call(this, options);
    }

    StringReplacer.prototype = new AbstractProcessor();
    StringReplacer.prototype.name = 'StringReplacer';
    StringReplacer.prototype.process = function (file, processContext, callback) {
        if (this.from && this.to) {
            file.setData(
                file.data.replace(from, to)
            );
        }

        callback();
    };

    return StringReplacer;
}
```


##### 第三步：使用自己的Processor

我们可以在`getProcessors`方法中，初始化自己的Processor类，并使用它。

```javascript
exports.getProcessors = function () {
    var StringReplacer = defineStringReplacer();

    return [
        new LessCompiler({
            // ...
        }),
        new CssCompressor({
            // ...
        }),
        new StringReplacer({
            files: [ 'index.html' ],
            from: 'oldvalue',
            to: 'newvalue'
        })
    ];
};
```

至此，我们已经完成了`StringReplacer`的开发和使用。