var NS = {};
var webView = null;
(function(w) {
	function shield() {
		return false;
	}
	document.addEventListener('touchstart', shield, false); //取消浏览器的所有事件，使得active的样式在手机上正常生效
	document.oncontextmenu = shield; //屏蔽选择函数
	function plusReady() {
		'use strict';
		webView = plus.webview.currentWebview();
		NS = {
			config: {
				imgPch: "http://localhost:8888/img/",
				ajaxPch: "http://localhost:8888"
			},
			log: function(msg) {
				console.log(webView.id + "-[" + getLogTime() + "]:" + msg);
			},
			openWindow: function(url, id, datas) {
				id || (id = url);
				mui.openWindow({
					url: url,
					id: id,
					extras: datas,
					createNew: false,
					show: {
						autoShow: true, //页面loaded事件发生后自动显示，默认为true
						event: 'titleUpdate', //页面显示时机，默认为titleUpdate事件时显示
					}
				});
			},
			ajax: function(url, datas, s, e) {
				if(mui.os.plus && (plus.networkinfo.getCurrentType() === plus.networkinfo.CONNECTION_NONE)) {
					mui.toast('<a href="javascript:void(0);" style="text-decoration: underline;color: #FFF;" onclick="window.location.reload();">亲~网络连接不上，请检测网络。点此刷新重试</a>', {
						duration: '3000',
						type: 'div'
					});
					return;
				}
				mui.ajax(url, {
					data: datas,
					dataType: 'json',
					type: 'post',
					timeout: 10000,
					headers: {
						'Content-Type': 'application/json'
					},
					success: function(data) {
						s(data);
					},
					error: function(xhr, type, errorThrown) {
						e(type);
					}
				});
			},
			setUserInfo: function(profile) {
				Object.getOwnPropertyNames(profile).forEach(function(val, idx, array) {
					if(typeof profile[val] == "object") {
						NS.setUserInfo(profile[val]);
					} else {
						plus.storage.setItem(val, profile[val]);
					}
				});
			},
			delFile: function(path) {
				if(path) {
					plus.io.resolveLocalFileSystemURL(path, function(entry) {
						entry.removeRecursively(function(entry) {
							mui.toast('清理成功', {
								duration: 'short',
								type: 'div'
							})
							NS.log("文件删除成功==" + path);
						}, function(e) {
							NS.log("文件删除失败=" + path);
						});
					});
				}
			}
		};
	}

	if(w.plus) {
		plusReady();
	} else {
		document.addEventListener('plusready', plusReady, false);
	}

})(window);

function getLogTime() {
	//小于10的时间数补零函数
	var pl = function(str) {
		if(str < 10) { //小于10 补零返回
			return "0" + str;
		} else { //不小于10 返回参数
			return str;
		}
	};
	var d = new Date();
	//返回格式化时间
	var NSString = d.getFullYear() + "-" + pl((d.getMonth() + 1)) + "-";
	NSString += pl(d.getDate()) + " " + pl(d.getHours());
	NSString += ":" + pl(d.getMinutes()) + ":" + pl(d.getSeconds());
	NSString += ":" + d.getMilliseconds();
	return NSString;
}
//图片下载任务集合
var taskArr = new Array();
var isStartTask = false;
//图片加载
window.loadImg = function(img) {
	//加载好了或者没有src
	if(img.getAttribute('data-loaded') || !img.getAttribute('data-src')) return;
	var image_url = img.getAttribute('data-src');
	if(!image_url.match(/^(?:http|ftp|https):\/\//)) {
		image_url = NS.config.imgPch + image_url;
	}
	//相对路径
	var hb_path = '_downloads/image/' + md5(image_url) + '.jpg';
	//绝对路径
	var sandBox_path = plus.io.convertLocalFileSystemURL(hb_path);
	var _img = new Image();
	_img.src = sandBox_path;
	_img.onload = function() {
		//设置为已经存在
		setLoaded(img, sandBox_path);
	};
	_img.onerror = function() {
		var temp = new Image();
		temp.onload = function() {
			setLoaded(img, image_url);
		};
		temp.src = image_url;
		img.setAttribute('hb_path', hb_path);
		img.setAttribute('sandBox_path', sandBox_path);
		taskArr.push(img);

		if(!isStartTask) {
			isStartTask = true;
			startTask();
		}
	}
}
/*给img设置背景,加载缓存标识*/
function setLoaded(obj, bg_url) {
	if(obj.getAttribute("data-loaded")) return;
	obj.classList.add("anim_opacity"); //渐变动画
	obj.classList.add("img_fill");
	obj.setAttribute("data-loaded", true); //标记成功
	obj.setAttribute("src", bg_url);

}

/**
 * 图片任务下载，图片第一次加载时下载图片保存本地
 * 递归调用方式保持只有一个downloader在下载,避免批量创建downloader手机发烫
 */
function startTask() {
	if(taskArr.length == 0) {
		isStartTask = false;
		return;
	}
	//从任务集合中取一个任务
	var obj = taskArr.shift();
	var image_url = obj.getAttribute('data-src');
	if(!image_url.match(/^(?:http|ftp|https):\/\//)) {
		image_url = NS.config.imgPch + image_url;
	}
	var hb_path = obj.getAttribute('hb_path');
	var sandBox_path = obj.getAttribute('sandBox_path');

	var temp = new Image();
	temp.src = sandBox_path;
	temp.onload = function() {
		startTask();
	};
	temp.onerror = function() {
		//执行下载
		var task = plus.downloader.createDownload(image_url, {
			"filename": hb_path,
			"timeout": 10,
			"retry": 2
		}, function(download, status) {
			setLoaded(obj, image_url);
			if(status == 200) {
				NS.log("下载成功");
			} else {
				app.delFile(hb_path);
				download.abort();
			}
			//继续下载
			startTask();
		});
		task.start();
	};
}