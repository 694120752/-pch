module.exports = {
    getEntry: getEntry, //获取json节点  
    isObjectNotEmpty: isObjectNotEmpty, // 对象是否为非空
    isNotNil: isNotNil, // 判断某个节点是否为空
}

/**
 * 获取json 各个节点的数据
 * @param {*} obj 
 * @param {*} rules 
 * @param {*} defaultValue 
 * 
 * 
 * 
 * eg:
 
                    var jsonData = {
                        a:{
                            b:"YES",
                            c:{
                                 d:"NO"
                            },
                            e:[1,2,3]
                        }
                    }

                var str = getEntry(jsonData,["a","c","d"]);
                var arr = getEntry(jsonData,["a","e"]);


                console.log(str);        ----->NO
                console.log(arr);        ----->[ 1, 2, 3 ]
 * 
 * 
 * 
 * 
 */

function getEntry(obj, rules, defaultValue = null) {
    if (typeof obj === 'object') {
        return rules.reduce((xs, x) => {
            return (xs && xs[x]) ? xs[x] : defaultValue
        }, obj)
    } else {
        return defaultValue;
    }
}


/**
 * 对象判空
 * @param obj 对象
 */
function isObjectNotEmpty(obj) {
    for (var n in obj) {
        return true;
    }
    return false;
}

/**
 * 节点判空
 * @param val 对象
 */
function isNotNil(val) {
    return val != null && val != "null" && val != "undefined" && val != undefined && val != '';
}

/**
 * 将数组转化为字符串
 * @param {字符串数组} array 
 * @param {分割字符} splitStr 
 */
function array2string(array, splitStr) {
    var str = "";
    for (const key in array) {
        const element = array[key];
        str += element + splitStr;
    }
    if (str.length > 0) {
        str = str.substr(0, str.length - 1);
    }
    return str;
}

/**
 * 判断是否是iphoneX
 *iPhone10,3 return @"iPhone X (Global)";
 *iPhone10,6 return @"iPhone X (GSM)";
 *iPhone11,2 return @"iPhone XS";
 *iPhone11,4 return @"iPhone XS Max";
 *iPhone11,6 return @"iPhone XS Max";
 *iPhone11,8 return @"iPhone XR";
 * 
 */
function isPhoneX(back) {
    wx.getSystemInfo({
        success: function (res) {
            var type = res.model;
            if (type.indexOf("iPhone X") != -1 || type.indexOf("iPhone XS") != -1 || type.indexOf("iPhone XR") != -1 || type.indexOf("iPhone10,3") != -1 || type.indexOf("iPhone10,6") != -1 || type.indexOf("iPhone11,2") != -1 || type.indexOf("iPhone11,4") != -1 || type.indexOf("iPhone11,6") != -1 || type.indexOf("iPhone11,8") != -1) {
                return back(true);
            } else {
                return back(false);
            }
        },
        fail: function (res) {
            return back(false);
        }
    })
}

