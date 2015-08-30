/**
 * @file 项目的入口文件
 * @author lidianbin(lidianbin@baidu.com)
 */
define(function (require) {

    console.log('load app1');
    var Phaser = require('Phaser');
    console.log(Phaser);
    console.log('load app2');
    var app = {
        run: function () {
            console.log('run');
            var game = new Phaser.Game(
                800, 600, Phaser.AUTO, '',
                {preload: preload, create: create, update: update}
            );

            function preload() {
                console.log('preload');
            }

            function create() {
                console.log('create');
            }

            function update() {
                console.log('update' + new Date());
            }
        }
    };
    return app;

});
