/**
 * @file 检测一些浏览器 requestAnimationFrame 实现不标准
 * @author: dabeen(lidianbin@baidu.com)
 * @date:   2016-08-22 21:03:14
 */


window.requestAnimationFrame = window.requestAnimationFrame
    || window.msRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame;

var t1 = 0;
var t2 = 0;
var last = Date.now();
function run() {
    var now = Date.now();
    var delta = now - last;

    if (delta < 12) {
        render(delta);
    }
    t1 += delta;

    if (t1 > 3000) {
        t2 += 3;
        // alert(t2);
        document.write('过去了：' + t2 + 's');
        document.write('<br/>');
        t1 = 0;
    }
    last = now;
    window.requestAnimationFrame(run);
}

window.requestAnimationFrame(run);

function render(delta) {
    document.write(delta + ',');
}
