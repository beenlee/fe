/**
 * @file 
 * @author: lidianbin(lidianbin@baidu.com)
 * @date:   2016-08-03 15:20:50
 */

console.log(module);
console.log('add');
// console.log(exports);

var add = function (a) {
    console.log(a);
};


module.exports = add;

// exports = add;
