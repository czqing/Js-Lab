
//by 函数接受一个成员名字符串和一个可选的次要比较函数作为参数，
//并返回一个可以用来对包含该成员的对象数组进行排序的比较数组，
//当 o[name] 和 p[name] 相等时，次要比较函数被用来比较
var by = function (name, minor) {
  return function (o, p) {
    var a, b;
    if (o && p && typeof o === 'object' && typeof p === 'object') {
      a = o[name];
      b = p[name];
      if (a === b) {
        return typeof minor === 'function' ? minor(o, p) : 0;
      }
      if (typeof a === typeof b) {
        return a < b ? -1 : 1;
      }
      return typeof a < typeof b ? -1 : 1;
    } else {
      throw {
        name: 'Error',
        message: 'Expected an object when sorting by ' + name
      };
    }
  };
};

//s.sort(by('last', by('first')));

var isNumber = function isNumber(value) {
  return typeof value === 'number' && isFinite(value);
};

var is_array = function (value) {
  return Object.prototype.toString.apply(value) === '[object Array]';
};
