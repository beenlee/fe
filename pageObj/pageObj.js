/**
 * @file 分页对象工具
 * @author lidianbin(lidianbin@baidu.com)
 */
define(function (require, exports) {

    // 动态列表的部分
    var pageObj =  {

        // 加载更多按钮的选择器
        loadMoreElm: null,

        // 除page外要传给url的参数的名字
        attrData: [],
        
        // 服务器的url
        url: null,

        // 当翻页后还有下一页时的样式
        haveMorePageStyle: function () {
            // var elm = $(this.loadMoreElm);
            // console.log('有更多页');
            // elm.html('查看更多');
            // elm.removeClass('middle-pageNomore');
        },

        // 当翻页后没有下一页时的样式
        noMorePageStyle: function () {
            // var elm = $(this.loadMoreElm);
            // console.log('没有下一页了');
            // elm.html('没有更多评论');
            // elm.addClass('middle-pageNomore');
        },

        // 将数据渲染成Dom并插入列表后
        appendListToDom: function (serverData) {
            // var html = etpl.render('activityList', serverData.data);
            // $('.middle-content').append(html);
        },

        // 将数据渲染成dom直接放到列表种
        insertListToDom: function (comment) {
            // var html = etpl.render('comment', comment);
            // $('.middle-content').html(html);
        },

        // 初始化page按钮的样式
        // {attrName: attrVal}
        init: function (page, pageSize, total, otherObj) {
            var elm = $(this.loadMoreElm);
            console.log('loadmore btn init');

            elm.attr('data-page', page)
                .attr('data-pageSize', pageSize)
                .attr('data-total', total);
            // 添加额外信息
            for (var i = 0, len = this.attrData.length; i < len; i++) {
                if (otherObj.hasOwnProperty(this.attrData[i])) {
                    elm.attr('data-' + this.attrData[i], otherObj[this.attrData[i]]);
                }
            }
            // elm.attr('data-page', page)
            //     .attr('data-pageSize', pageSize)
            //     .attr('data-total', total)
            //     .attr('data-category', category)
            //     .attr('status', '0');
            // 检查是否有下一页并初始化样式
            this.hasNextPage(total, pageSize, page);
            return this;
        },

        // 检查是否还有下一页
        // total 总条数； pageSize 每页的条数； page 当前页
        hasNextPage: function (total, pageSize, page) {
            var elm = $(this.loadMoreElm);
            total || (total =  Number.parseInt(elm.attr('data-total')));
            pageSize || (pageSize = Number.parseInt(elm.attr('data-pageSize')));
            page || (page = Number.parseInt(elm.attr('data-page')));
            if (total && pageSize && page) {
                if (Math.ceil(total / pageSize) > page) {
                    this.haveMorePageStyle();
                    return ++page;
                }
            }

            this.noMorePageStyle();
            return false;
        },

        /**
         * 给翻页卡片绑定事件
         *
         */
        bindEvent: function () {

            this.hasNextPage();
            var elm = $(this.loadMoreElm);
            var self = this;
            // 绑定点击事件
            elm.on('click', function (e) {

                var nextPage = self.hasNextPage();
                if (nextPage === false) {
                    console.log('没有下一页了');
                    return false;
                }

                if ($(this).attr('status') !== '1') {
                    $(this).attr('status', '1');
                    // 设置category
                    var sendData = {};
                    // console.log(self.attrData);
                    for (var i = 0, len = self.attrData.length; i < len; i++) {
                        sendData[self.attrData[i]] = $(this).attr(self.attrData[i]);
                    }
                    sendData.page = nextPage;
                    $.getJSON(
                        self.url,
                        sendData
                    ).then(function (serverData) {
                        console.log(serverData);
                        $(this).attr('status', '0');
                        self.appendListToDom(serverData);
                        // var html = etpl.render('activityList', serverData.data);
                        // $('.middle-content').append(html);

                        $(this).attr('data-page', serverData.data.page);
                        $(this).attr('data-pageSize', serverData.data.pageSize);
                        $(this).attr('data-total', serverData.data.total);
                        var total = Number.parseInt(serverData.data.total);
                        var pageSize = Number.parseInt(serverData.data.pageSize);
                        var page = Number.parseInt(serverData.data.page);
                        if (self.hasNextPage(total, pageSize, page) === false) {
                            console.log('没有下一页了');
                        }

                    }.bind(this)).fail(function (e) {
                        console.log(e);
                        $(this).attr('status', '0');
                    }.bind(this));
                }
                else {
                    console.log('wait! i am busy!');
                }
            });
        },

        // 生成一个子类
        createSub: function (child) {
            var parent = this;
            child || (child = {});
            for (var p in parent) {
                if (parent.hasOwnProperty(p) && !child.hasOwnProperty(p)) {
                    child[p] = parent[p];
                }
            }
            return child;
        }
    };
    return pageObj;
});

// =======================================
// 使用方法：
// =======js代码=========
// var commentPage = pageObj.createSub({
//     loadMoreElm: '#more-comments', // 按钮的class或者id
//     attrData: ['data-activityId', 'data-category'], // 除page外要传给url的参数在dom上的名字
//     url: url.comment,  // 要请求的url
//     // 当翻页后还有下一页时的样式
//     haveMorePageStyle: function () {
//         var elm = $(this.loadMoreElm);
//         console.log('有更多页');
//         elm.html('查看更多');
//         elm.removeClass('t-d-m-f-pageNomore');
//     },
//     // 当翻页后没有下一页时的样式
//     noMorePageStyle: function () {
//         var elm = $(this.loadMoreElm);
//         console.log('没有下一页了');
//         elm.html('没有更多评论');
//         elm.addClass('t-d-m-f-pageNomore');
//     },
//     // 将数据渲染成Dom并插入列表后
//     appendListToDom: function (serverData) {
//         var html = etpl.render('comment', serverData.data);
//         $('.t-d-m-f-list').append(html);
//     },

//     // 将数据渲染成dom直接放到列表种
//     insertListToDom: function (comment) {
//         var html = etpl.render('comment', comment);
//         $('.t-d-m-f-list').html(html);
//     }
// });
// commentPage.bindEvent();
// 如果需要用js设置初始dom上和列表中的数据执行commentPage.init(page, pageSize, total, otherObj);
//
// ====html结构======
// <div class="comment-list">这里是放内容的</div>
// <div id="more-comment" data-page="1" data-pageSize="10"
// data-total="11" data-category="ALL" status="0" class="middle-page">
//  查看更多
//  </div>
// data-page data-pageSize data-total 为必须的分页属性
// data-category 为接口要求的除page外其他自定属性
// =============================
