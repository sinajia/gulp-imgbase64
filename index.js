"use strict";
const path = require('path');
const gutil = require('gulp-util');
const through = require('through2');
const PluginError = gutil.PluginError;
const fs = require('fs');
const TAG = '<CONERT-HTML-IMG-BASE64>';
const END = '</CONERT-HTML-IMG-BASE64>';
const EXTIMG = /(\<img)(\s)+/gi;
const EXTQUOT = /^(\s)*\=?(\s)*[\"\'].*/g;
const LIMIT = 8 * 1024;
const PLUGIN_NAME = 'gulp-imgbase64';

function plugin(option) {
  let limit = option ? fileSize(option.limit) : LIMIT;
  var stream = through.obj(function(file, enc, cb) {
    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return cb();
    }
    if (file.isBuffer()) {
      let contents = file.contents.toString('utf8');
      let html_path = file.path;
      let Block = [];

      let cutFile = function (content){
        var i_start = -1;
        var i_end = -1;
        for(;;) {
          i_start = content.indexOf(TAG);
          if(i_start == -1) {
            if(Block.length > 0) {
              Block.push({
                will: false,
                data: content
              });
            }
          return;
          }
          i_end = content.indexOf(END);
          if(i_end == -1 || i_start > i_end) {
            Block = [];
            return;
          }
          Block.push({
            will: false,
            data: content.substring(0, i_start)
          });
          Block.push({
            will: true,
            data: content.substring(i_start + TAG.length, i_end)
          });
          content = content.substring(i_end + END.length);
        }
      }  //end func
      cutFile(contents);

      var transFile = function () {
        if(Block.length == 0) return contents;

        for (let i = 0; i < Block.length; ++i) {
          if(Block[i].will) {
            processPiece(i);
          }
        }
        let content = '';
        for(let i = 0; i < Block.length; ++i){
          if(Block[i].will){
            if(Block[i].data_piece.length == Block[i].img_64.length + 1)
              ;
            else return contents;
            for (let j = 0; j < Block[i].data_piece.length; ++j){
              content += Block[i].data_piece[j];
              if( j < Block[i].img_64.length ) {
                content += Block[i].img_64[j];
              }
            }
          }else{
            content += Block[i].data;
          }
        }
        return content;
      } //end 

      var processPiece = function (i) {
        var piece = Block[i].data;
        var i_start = -1;
        var i_end = -1;
        Block[i].data_piece = [];
        Block[i].img_64 = [];
        for(;;){
          i_start = quot_start(piece, limit, html_path);
          if(i_start == -1) {
            Block[i].data_piece.push(piece);
            return;
          }
          i_end = quot_end(piece, i_start);
          Block[i].img_64.push(transBase64(path_regular(piece.substring(i_start + 1, i_end), 
                limit,
                html_path ) ) );
          Block[i].data_piece.push(piece.substring(0, i_start + 1));
          piece = piece.substring(i_end);
        }
      } //end func
      
      file.contents = new Buffer(washTags(transFile()));
    }
    this.push(file);
    cb();
  });
  return stream;
};

function washTags(html){
  html = html.replace(/\<CONERT-HTML-IMG-BASE64\>/g, '');
  html = html.replace(/\<\/CONERT-HTML-IMG-BASE64\>/g, '');
  return html;
}

function fileSize(limit) {
  if(!limit) return LIMIT;
  let start, end;
  const BEGNUM = /(\d){1}/;
  const NUMEND = /(\d\D)/;
  start = limit.search(BEGNUM);
  end = limit.search(NUMEND);
  if(start == -1 || end == -1) return LIMIT;
  limit = limit.substring(start, end + 1);
  try{
    limit = limit - 0;
  }catch(e){
    return LIMIT;
  }
  return (1024 * limit);
}
/**
 * content is a path in html
 * html is html file path
 */
function path_regular(content, limit, html){
  if(content.length == 0) return '';
  var begin = -1;
  var end = -1;
  var Ext = /\S/g;
  begin = content.search(Ext);
  if(begin == -1) return '';
  var reverse = content.split('').reverse().join('');
  end = content.length - reverse.search(Ext);
  content = content.substring(begin, end);
  if(content.indexOf('http://') == 0
    || content.indexOf('https://') == 0)
    return '';
  if(content.lastIndexOf('.png') == content.length - 4
    || content.lastIndexOf('.jpg') == content.length -4
    || content.lastIndexOf('.jpeg') == content.length -5
    || content.lastIndexOf('.gif') == content.length - 4
    )
    ;
  else return '';
  try{
    content = path.resolve(html, '..', content);
    let stat = fs.statSync(content);
    if(stat.size && stat.size <= limit)
      ;
    else throw new Error('');
  }catch(e){
    return '';
  }
  return content;
}
/**
 * file  is a valid local img path
 */
function transBase64(file){
  const LEN = file.length;
  let suffix = '';
  if(file.lastIndexOf('.png') == LEN - 4)
    suffix = 'png';
  else if(file.lastIndexOf('.jpg') == LEN - 4)
    suffix = 'jpg';
  else if(file.lastIndexOf('.gif') == LEN - 4)
    suffix = 'gif';
  else suffix = 'jpeg';
  let prefix = 'data:image/'+ suffix +';base64,';
  prefix = prefix + fs.readFileSync(file).toString('base64');
  return prefix;
}
/*
find '/" pos
*/
function quot_start(content, limit, html_path) {
  let img_start = -1;
  let img_end = -1;
  let piece = content;
  let word_count = 0;
  for(;;) {
    img_start = piece.search(EXTIMG);
    if(img_start == -1) return -1;
    img_end = angleBracket(piece, img_start);
    if(img_end == -1) return -1;
    // <img xxx= ""  src="ssss" >
    let img_tag = piece.substring(img_start, img_end + 1);
    let src_quot_start = quot_pos(img_tag, limit, html_path);
    if(src_quot_start == -1){
      word_count += (img_end + 1);
      piece = piece.substring(img_end + 1);
    }else{
      src_quot_start = img_start + src_quot_start;
      return (word_count + src_quot_start);
    }
  }
}
/*
dot is index->'/"
*/
function quot_end(content, dot) {
  for(let i = dot + 1; i < content.length; ++i){
    if(content[dot] == content[i]) return i;
  }
  return -1;
}
/**
 * find > not in '/"
 */
function angleBracket(content, dot){
  let referencing = false;
  let mark = '';
  for(let i = dot; i < content.length; ++i) {
   if(referencing){
     if((content[i] == '"' || content[i] == '\'') && mark == content[i]){
      mark = '';
      referencing = false;
     }
   }else{
     if(content[i] == '"' || content[i] == '\''){
      referencing = true;
      mark = content[i];
     }else if(content[i] == '>'){
      return i;
     }
   }
  }
  return -1;
}
/*
img tag
*/
function quot_pos(content, limit, html_path) {
  let referencing = false;
  let mark = '';
  for(let i = 0; i < content.length; ++i){
    if(referencing){
      if((content[i] == '"' || content[i] == '\'') && mark == content[i]){
        mark = '';
        referencing = false;
      }
    } else{
      if(content[i] == '"' || content[i] == '\''){
        referencing = true;
        mark = content[i];
      } else {
        let piece = content.substring(i, i + 4);
        if ( piece == 'src=' 
         || piece == 'src '
         || piece == 'src\t'
         || piece == 'src\n'
         || piece == 'src\r'
        ){
          i += 4;
          let aft_src = content.substring(i);
          if(aft_src.search(EXTQUOT) == 0){
            let offset = first_quot_pos( aft_src, limit, html_path);
            if(offset == -1) return -1;
            return (i + offset);
          } else return -1;
        }
      }
    }
  } // end-for
  return -1;
}
/**
 * content is
 * =  "../imgages/..." xxxx
 *  or
 *    =   '../images/...' xxx
 */
function first_quot_pos(content, limit, html_path){
  let mark = '';
  let start;
  let referencing = false;
  for(let i = 0; i < content.length; ++i){
    if(referencing){
      if((content[i] == '"' || content[i] == '\'') && mark == content[i]){
        let url = content.substring(start + 1, i);
        if(path_regular(url, 
          limit,
          html_path
        )) return start;
        return -1;
      }
    }else{
      if(content[i] == '"' || content[i] == '\''){
        mark = content[i];
        referencing = true;
        start = i;
      }
    }
  }
  return -1;
}

module.exports = plugin;
