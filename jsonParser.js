var json_parse = function() {
  //json文本解析为javascript数据结构
  //简单地地柜降序解析器

  var at, ch,
    escapee = {
      '"': '"',
      '\\': '\\',
      '/': '/',
      b: 'b',
      f: '\f',
      n: '\n',
      r: '\r',
      t: '\t'
    },
    text,

    error = function (m) {
      throw {
        name: 'SyntaxError',
        message: m,
        at: at,
        text: text
      };
    },

    next = function (c) {
      //如果提供了参数c，则检验它是否匹配当前字符
      if (c && c !== ch) {
        error("Expected '" + c + "' intead of '" + ch + "'");
      }
      //获取下一个字符。当没有下一个字符时，返回一个空字符串
      ch = text.charAt(at);
      at += 1;
      return ch;
    },

    number = function () {
      //解析一个数字值
      var number,
        string = '';
      if (ch === '-') {
        string = '-';
        next('-');
      }
      while (ch >= '0' && ch <= '9') {
        string += ch;
        next();
      }
      if (ch === '.') {
        string += '.';
        while (next() && ch >= '0' && ch <= '9') {
          string += ch;
        }
      }
      if (ch === 'e' || ch === 'E') {
        string += ch;
        next();
        if (ch === '-' || ch === '+') {
          string += ch;
          next();
        }
        while (ch >= '0' && ch <= '9') {
          string += ch;
          next();
        }
      }
      number = +string;
      if (isNaN(number)) {
        error("Bad number");
      }
      else {
        return number;
      }
    },

    string = function () {
      //解析一个字符串值
      var hex, i,
        string = '',
        uffff;
      //解析字符串时，必须找到"和\字符
      if (ch === '"') {
        while(next()) {
          if (ch === '"') {
            next();
            return string;
          } else if (ch === '\\') {
            next();
            if (ch === 'u') {
              uffff = 0;
              for (i = 0; i < 4; i += 1) {
                hex = parseInt(next(), 16);
                if (!isFinite(hex)) {
                  break;
                }
                uffff = uffff * 16 + hex;
              }
              string += string.fromCharCode(uffff);
            } else if (typeof escapee[ch] === 'string') {
              string += escapee[ch];
            } else {
              break;
            }
          } else {
            string += ch;
          }
        }
      }
      error("Bad String");
    },

    white = function () {
      //跳过空白
      while (ch && ch <= ' ') {
        next();
      }
    },

    word = function () {
      //true, false或null
      switch (ch) {
        case 't':
          next('t');
          next('r');
          next('u');
          next('e');
          return true;
        case 'f':
          next('f');
          next('a');
          next('l');
          next('s');
          next('e');
          return false;
        case 'n':
          next('n');
          next('u');
          next('l');
          next('l');
          return null;
      }
      error("Unexpected '" + ch + "'");
    },

    value,  //值函数的占位符
    
    array = function () {
      //解析一个数组值
      var array = [];
      if (ch === '[') {
        next('[');
        white();
        if (ch === ']') {
          next(']');
          return array; //空数组
        }
        while (ch) {
          array.push(value());
          white();
          if (ch === ']') {
            next(']');
            return array;
          }
          next(',');
          white();
        }
      }
      error("Bad Array");
    },

    object = function () {
      //解析一个对象值
      var key,
        object = {};

      if (ch === '{') {
        next('{');
        white();
        if (ch === '}') {
          next('}');
          return object;  //空对象
        }
        while (ch) {
          key = string();
          white();
          next(':');
          object[key] = value();
          white();
          if (ch === '}') {
            next('}');
            return object;
          }
          next(',');
          white();
        }
      }
      error("Bad object");
    };

    value = function () {
      //解析一个JSON值，可能是对象、数组、字符串、数字或一个词
      white();
      switch (ch) {
        case '{':
          return object();
        case '[':
          return array();
        case '"':
          return string();
        case '-':
          return number();
        default:
          return ch >= '0' && ch <= '9' ? number() : word();
      }
    };

    //返回json_parse函数
    return function (source, reviver) {
      var result;
      
      text = source;
      at = 0;
      ch = ' ';
      result = value();
      white();
      if (ch) {
        error("Syntax error");
      }

      return typeof reviver === 'function' ?
        function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        }({'': result}, '') : result;

    };
}();
