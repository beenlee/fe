/**
 * @file 
 * @author: lidianbin(lidianbin@baidu.com)
 * @date:   2016-02-05 19:08:30
 */

module.exports = {
    entry: './entry.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: 'style!css'}
        ]
    }
};