
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

Function.prototype.method = function (name, func) {
  if (!this.prototype[name]) {
    this.prototype[name] = func;
  }
  return this;
};

Number.method('integer', function () {
  return Math[this < 0 ? 'ceil' : 'floor'](this);
});

String.method('trim', function () {
  return this.replace(/^\s+|s+$/g, '');
});

//定义walk_the_DOM函数，从某个指定的节点开始，按HTML源码中的顺序
//访问该树的每个节点
var walk_the_DOM = function walk(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walk(node, func);
    node = node.nextSiblings;
  }
};

String.method('deentityify', function () {
  //字符实体表
  var entity = {
    quot: '"',
    lt: '<',
    gt: '>'
  };

  //返回deentityify方法
  return function () {
    //这才是deentityify方法，调用字符串的replace方法
    return function () {
      return this.replace(/&([^&;]+);/g,
        function (a, b) {
          var r = entity[b];
          return typeof r === 'string' ? r : a;
        }
      );
    };
  };
}());

var memoizer = function (memo, formula) {
  var recur = function (n) {
    var result = memo[n];
    if (typeof result !== 'number') {
      result = formula (recur, n);
      memo[n] = result;
    }
    return result;
  };
  return recur;
};

var fibonacci = memoizer([0, 1], function (recur, n) {
  return recur (n - 1) + recur (n - 2);
});

var factorial = memoizer([1, 1], function (recur, n) {
  return n * recur (n - 1);
});
