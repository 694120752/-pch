# pch

###common-mui.js
配合mui的pch文件
配置资源路径，设置ajax，本地存储用户信息，删除文件 助理plus事件冲突
时间和下载图片工具
---

###common-wxminip.js
配合微信小程序的pch 与业务分开

组件中生命周期里要取消setData 防止内存泄露
(```)
detached() {
    this.setData = (data, callBack) => {
      return;
    }
  }

(```)
请求接受所有类型
(```)
wx.request({headers:{"Accept":"*/*"}});
(```)


