var fs = require("fs");
var JSZip = require("jszip");

var dao = require("./dao");
var xlsx = require('node-xlsx');
var _ = require('lodash');


/**
 * @callback FilePathCallback
 * @param {string} filePath
 */



module.exports = {
    /**
     * 创建图片、下载等文件夹
     */
    initDir: function () {
        fs.mkdirSync(__dirname + "/upload_tmp/", {
            recursive: true
        });
        fs.mkdirSync(__dirname + "/data/image", {
            recursive: true
        });
        fs.mkdirSync(__dirname + "/public/download/", {
            recursive: true
        });

        let classIds = dao.getClassList();
        for (let i in classIds) {
            fs.mkdirSync(__dirname + "/data/image/" + classIds[i], {
                recursive: true
            });
        }
    },

    /**
     * 返回截图压缩包路径
     * @param {string} classId 
     * @param {FilePathCallback} callback
     */
    getPackagePath: function (classId, callback) {

        var lastTask = dao.getLastTask();
        let fileName = classId + " " + lastTask.name + ".zip";

        let filePath = "/download/" + fileName;

        //没有新上传
        if (!dao.getNewUpLoad(classId)) {
            return filePath;
        }


        var infoList = dao.getImageList(lastTask, classId);

        var zip = new JSZip();
        for (var i in infoList) {
            let filePath = infoList[i].path;
            let fileName = infoList[i].name + "-" + (infoList[i].label == "info-img" ? "信息界面" : "完成界面") + "-" + infoList[i].timestamp + filePath.substring(filePath.lastIndexOf('.'));
            zip.file(infoList[i].name + "/" + fileName, fs.readFileSync(__dirname + "/data/image/" + infoList[i].path));
        }

        zip.generateAsync({ //设置压缩格式，开始打包
            type: "nodebuffer", //nodejs用
            compression: "DEFLATE", //压缩算法
            compressionOptions: { //压缩级别
                level: 9
            }
        }).then(function (content) {
            var fileName = classId + " " + lastTask.name + ".zip";
            fs.writeFileSync(__dirname + "/public/download/" + fileName, content); //将打包的内容写入 当前目录下的 result.zip中
            dao.setNewUplaod(classId);

            callback(filePath);
            // return filePath;
        });
        // return "no zip file";
    },

    /**
     * 返回旧报表路径
     * @param {string} classId 
     * @param {FilePathCallback} callback
     */
    getReportPath: function (classId, callback) {

        var lastTask = dao.getLastTask();
        var infoList = dao.getImageList(lastTask, classId)
        var memberList = dao.getMember(classId);

        var data = [{
            name: "sheet1",
            data: [
                [
                    classId + "班 " + lastTask.name
                ],
                [
                    "序号",
                    "姓名",
                    "是否提交"
                ]
            ],
            options: {
                '!merges': [{
                    s: {
                        c: 0,
                        r: 0
                    },
                    e: {
                        c: 2,
                        r: 0
                    }
                }]
            }
        }];

        var uploadAmount = 0;
        for (let i in memberList) {
            var row = [
                String(parseInt(i) + 1),
                memberList[i]
            ]
            if (_.findIndex(infoList, (s) => {
                    return s.name == memberList[i]
                }) == -1) {
                row.push("    ✕");
            } else {
                row.push("✓")
                uploadAmount++;
            }
            data[0].data.push(row);
        }
        data[0].data.push([]);
        data[0].data.push([
            "团员人数：",
            "",
            String(memberList.length)
        ]);
        data[0].data.push([
            "上交人数：",
            "",
            String(uploadAmount)
        ])
        data[0].data.push([
            "未交人数：",
            "",
            String(memberList.length - uploadAmount)
        ])
        data[0].data.push([
            "创建时间：",
            "",
            new Date().toLocaleString('zh-cn', {
                timeZone: "Asia/Shanghai"
            })
        ])
        for (let i = 0; i < 4; i++) {
            data[0].options["!merges"].push({
                s: {
                    c: 0,
                    r: memberList.length + 3 + i
                },
                e: {
                    c: 1,
                    r: memberList.length + 3 + i
                }
            })
        }



        var buffer = xlsx.build(data);

        var fileName = classId + " " + lastTask.name + " 收集报表.xlsx";

        // @ts-ignore
        fs.writeFileSync(__dirname + "/public/download/" + fileName, buffer);
        callback("/download/" + fileName);

        // return "/download/" + fileName;
    },

    /**
     * 返回新报表路径
     * @param {string} classId 
     * @param {FilePathCallback} callback
     */
    getReportPath2: function (classId, callback) {

        var lastTask = dao.getLastTask();
        var infoList = dao.getImageList(lastTask, classId)
        var memberList = dao.getMember(classId);
        var data = [{
            name: "sheet1",
            data: [
                [
                    "班级", "总人数", "完成人数", "未完成人数", "未完成名单"
                ]
            ],
            options: {
                '!cols': [{
                    wch: 6
                }, {
                    wch: 7
                }, {
                    wch: 9
                }, {
                    wch: 11
                }, {
                    wch: 30
                }]
            }
        }];

        var namesStr = "";
        var amount = 0;
        for (let i in memberList) {
            if (_.findIndex(infoList, (s) => {
                    return s.name == memberList[i]
                }) == -1) {
                if (amount) {
                    namesStr += "、"
                }
                namesStr += memberList[i];
                amount++;
            }
        }
        data[0].data.push([
            classId,
            String(memberList.length),
            String(memberList.length - amount),
            String(amount),
            namesStr
        ]);
        for (let i = 0; i < 5; i++) {
            data[0].data.push([]);
        }
        data[0].data.push([
            "时间：",
            new Date().toLocaleString('zh-cn', {
                timeZone: "Asia/Shanghai"
            })
        ])
        var buffer = xlsx.build(data);

        var fileName = classId + " " + lastTask.name + " 收集报表-新版.xlsx";

        // @ts-ignore
        fs.writeFileSync(__dirname + "/public/download/" + fileName, buffer);
        callback("/download/" + fileName);
    }

}