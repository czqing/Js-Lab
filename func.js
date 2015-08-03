
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
    return this.replace(/&([^&;]+);/g,
      function (a, b) {
        var r = entity[b];
        return typeof r === 'string' ? r : a;
      }
    );
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

var eventuality = function (that) {
  var registry = {};
  that.fire = function (event) {
    //在一个对象上触发一个事件。该事件可以是一个包含事件名称的字符串，
    //或者是一个拥有包含事件名称的type属性的对象
    //通过'on'方法注册的事件处理程序中匹配事件名称的函数将被调用
    var array, func, handler, i,
      type = typeof event === 'string' ? event : event.type;

    //如果这个事件存在一组事件处理程序，则遍历并按顺序依次执行
    if (registry.hasOwnProperty(type)) {
      array = registry[type];
      for (i = 0; i < array.length; i += 1) {
        handler = array[i];
        //每个处理程序包含一个方法和一个可选的参数
        //如果该方法是一个字符串形式的名字，则寻找该函数
        func = handler.method;
        if (typeof func === 'string') {
          func = this[func];
        }
        //调用一个处理程序。如果该条目包含参数，则传递它过去；否则，传递该事件对象
        func.apply(this,
          handler.parameters || [event]);
      }
    }
    return this;
  };

  that.on = function (type, method, parameters) {
    //注册一个事件，构造一条处理程序条目，将它插入到处理程序数组中，
    //如果这种类型的事件还不存在，就构造一个
    var handler = {
      method: method,
      parameters: parameters
    };
    if (registry.hasOwnProperty(type)) {
      registry[type].push(handler);
    } else {
      registry[type] = handler;
    }
    return this;
  };

  return that;
};

var parse_url = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

var parse_number = /^-?\d+(?:\.\d*)?(?:e[+\-]?\d+)?$/i;

var doubled_words = /([A-Za-z\u00C0-\u1FFF\u2800-\uFFFD]+)\s+\1/gi;

var parse_ASCII = /[!-\/:-@\[-`{-~]/; //由32个ASCII的特殊字符组成的集合
