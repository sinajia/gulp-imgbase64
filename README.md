# gulp-imgbase64
**将 html 文件中的 img 元素 src 属性引用的图片转换为 base64 编码的 Data Url 格式，减少网页加载过程中 http 请求的次数**

gulp-imgbase64 is a gulpplugin.It will search all img tags in a html file.Then It converts src to Data Url.
The purpose is to reduce the number of http requests.

## Install

```
$ npm install --save-dev gulp-imgbase64
```

## Usage

**Add ```<CONERT-HTML-IMG-BASE64>``` and ```</CONERT-HTML-IMG-BASE64>``` to html source file to tell gulp-imgbase64 which img tags need to be converted**
<br> 

```html
<!-- before conversion -->
<!doctype html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
<div >
	<div class="But">
	<CONERT-HTML-IMG-BASE64>
		<Img src 
		  =  ' https://www.baidu.com/img/bd_logo1.png ' class=''/ >
			<Img src 
		  =  '
						images/example.png ' title="test">
			<Img src="images/example.png" title="test">
			<img src
			    =
					"
					images/example2.png
					" 
					title="test">
	</CONERT-HTML-IMG-BASE64>
	</div>
</div>
</body>
</html>
```

```html
<!-- after conversion -->
<!doctype html>
<html lang="en">
 <head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
<div >
	<div class="But">
	
		<Img src 
		  =  ' https://www.baidu.com/img/bd_logo1.png ' class=''/ >
			<Img src 
		  =  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAYAAADmOUiuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAA9SURBVFhH7c4hAQAwDMCw+Vd1Z5uIkIOC8My+2Z8VVAVVQVVQFVQFVUFVUBVUBVVBVVAVVAVVQVVQFTSzB/30/+NN9LN8AAAAAElFTkSuQmCC' title="test">
			<Img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAjCAYAAADmOUiuAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAA9SURBVFhH7c4hAQAwDMCw+Vd1Z5uIkIOC8My+2Z8VVAVVQVVQFVQFVUFVUBVUBVVBVVAVVAVVQVVQFTSzB/30/+NN9LN8AAAAAElFTkSuQmCC" title="test">
			<img src
			    =
					"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAiCAYAAADcbsCGAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAA/SURBVFhH7c4hAQAgEAAxKn1AIpMBOkwhTsxvnT33V+VUOVVOlVPlVDlVTpVT5VQ5VU6VU+VUOVVOlVMf5+Y+D+p6cA0gi/8AAAAASUVORK5CYII=" 
					title="test">
	
	</div>
</div>
</body>
</html>
```


```js
'use strict';

const gulp = require('gulp');
const img64 = require('../index.js');

gulp.task('img64', function() {
    return gulp.src('./html/*.html')
        .pipe(img64({
            limit: '7kb'
        }))
        .on("error", function(error) {
            console.error(error.toString());
            this.emit("end");
        })
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['img64']);
```

## API

### img64([options])

#### options

Type:`object`<br>

Default limit is 8kb

## License

MIT
