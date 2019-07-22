'use strict'
const gutil = require('gulp-util')
const through = require('through2')
const fs = require('fs')
const nodepath = require('path')

module.exports = function (options) {
    // 默认配置
    const defaultOptions = {
        debug       : false,
        fileReg     : /^[\B\n]?\$import\(['"](.*)['"]\)/gi,
        alias       : {},
        splitchunk  : false,
    };
    // 自定义配置覆盖默认配置
    const { fileReg , debug , alias , splitchunk } = Object.assign(defaultOptions,options);
    // 记录编译文件，防止重复编译
    const importStack = {};   

    // 输出控制台
    const message = (msg) => {
        if(debug){
            console.log(msg)
        }
    }

    // 加载文件
    const importJS = (path,importStack) => {

        if (!fs.existsSync(path)) {
            message(`${path} Not found!`);
            return '';
        }

        let content = fs.readFileSync(path, {
            encoding: 'utf8'
        })

        importStack[path] = path;
        content = content.replace(fileReg, (match, fileName) => {
            // 处理路径别称
            Object.keys(alias).map( v => { fileName = fileName.replace(alias[v],v) });

            const { dir , root } = nodepath.parse(fileName);
            const parentPath = root ? nodepath.resolve( '.'+ nodepath.sep ) : nodepath.parse(path).dir;
            
            // 获取真实的绝对路径
            const importPath =  nodepath.join( parentPath , fileName);

            if( importStack.hasOwnProperty(importPath) )return '';

            message(`import ${fileName} --> ${path}`);

            let importContent = importJS(importPath,importStack);

            return importContent;
        });

        return content;
    }

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file)
			return
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-include-js', 'Streaming not supported'))
			return
		}

		file.contents = Buffer.from(importJS(file.path,splitchunk ? {} : importStack ));
		file.path = gutil.replaceExtension(file.path, '.js');
		message(`${file.path} ImportJS finished.`)
		cb(null, file)
	})
}