var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var multer = require('multer');
var JSZip = require("jszip");
var fs = require("fs");
var _ = require('lodash');
var xlsx = require('node-xlsx');

fs.mkdirSync(__dirname + "/../public/download/", {
    recursive: true
});
var upload = multer()

var db = require("./../db");
const {
    getUnpackedSettings
} = require('http2');

router.get('/classid/:classId', function (req, res, next) {

    var classId = req.params.classId;
    var lastTask = db.get("task").last().value();

    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();

    var absList = [];
    var memberList = db.get("member." + classId).value();
    if (memberList) {
        for (let i in memberList) {
            if (_.findIndex(infoList, (s) => {
                    return s.name == memberList[i]
                }) == -1) {
                absList.push(memberList[i]);
            }
        }
    }

    res.render('info', {
        title: '收截图~~',
        classId: classId,
        infoList: infoList,
        absList: absList,
        task: lastTask
    });
});

router.get('/download/classid/:classId', function (req, res, next) {

    var classId = req.params.classId;
    var newUploadKey = "newUpload." + classId;

    if (!db.has(newUploadKey).value()) {
        db.set(newUploadKey, true).write();
    }

    var newUpload = db.get(newUploadKey);
    if (!newUpload) {
        var fileName = classId + " " + lastTask.name + ".zip";
        res.redirect("/download/" + fileName);
        return;
    }




    var lastTask = db.get("task").last().value();

    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();

    var zip = new JSZip();
    for (var i in infoList) {
        var filePath = infoList[i].path;
        var fileName = infoList[i].name + "-" + (infoList[i].label == "info-img" ? "信息界面" : "完成界面") + "-" + infoList[i].timestamp + filePath.substring(filePath.lastIndexOf('.'));

        zip.file(infoList[i].name + "/" + fileName, fs.readFileSync(__dirname + "/../data/image/" + infoList[i].path));

    }

    zip.generateAsync({ //设置压缩格式，开始打包
        type: "nodebuffer", //nodejs用
        compression: "DEFLATE", //压缩算法
        compressionOptions: { //压缩级别
            level: 9
        }
    }).then(function (content) {
        // console.log(infoList);
        var fileName = classId + " " + lastTask.name + ".zip";
        fs.writeFileSync(__dirname + "/../public/download/" + fileName, content); //将打包的内容写入 当前目录下的 result.zip中
        db.set(newUploadKey, false).write();
        res.redirect("/download/" + fileName);
    });
});


router.get('/download/classid/:classId/report', function (req, res, next) {

    var classId = req.params.classId;

    var lastTask = db.get("task").last().value();

    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();

    var memberList = db.get("member." + classId).value();

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
            parseInt(i) + 1,
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
        memberList.length
    ]);
    data[0].data.push([
        "上交人数：",
        "",
        uploadAmount
    ])
    data[0].data.push([
        "未交人数：",
        "",
        memberList.length - uploadAmount
    ])
    data[0].data.push([
        "创建时间：",
        "",
        new Date().toLocaleString()
    ])
    for(let i=0;i<4;i++){
        data[0].options["!merges"].push({
            s: {
                c: 0,
                r: memberList.length+3+i
            },
            e: {
                c: 1,
                r: memberList.length+3+i
            }
        })
    }



    var buffer = xlsx.build(data);

    var fileName = classId + " " + lastTask.name + " 收集报表.xlsx";

    fs.writeFileSync(__dirname + "/../public/download/" + fileName, buffer);
    res.redirect("/download/" + fileName);

});

router.get('/download/classid/:classId/report2', function (req, res, next) {

    var classId = req.params.classId;
    var lastTask = db.get("task").last().value();
    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();
    var memberList = db.get("member." + classId).value();
    var data = [{
        name: "sheet1",
        data: [
            [
                "班级","总人数","完成人数","未完成人数","未完成名单"
            ]
        ],
        options:{
            '!cols': [{ wch: 6 }, { wch: 7 }, { wch: 9 }, { wch: 11 },{wch:30} ]
        }
    }];

    var namesStr="";
    var amount = 0;
    for (let i in memberList) {
        if (_.findIndex(infoList, (s) => {
                return s.name == memberList[i]
            }) == -1) {
            if(amount){
                namesStr+="、"
            }
            namesStr+=memberList[i];
            amount++;
        } 
    }
    data[0].data.push([
        classId,
        memberList.length,
        memberList.length-amount,
        amount,
        namesStr
    ]);
    for(let i=0;i<5;i++){
        data[0].data.push([]);
    }
    data[0].data.push([
        "时间：",
        new Date().toLocaleString()
    ])
    var buffer = xlsx.build(data);

    var fileName = classId + " " + lastTask.name + " 收集报表-新版.xlsx";

    fs.writeFileSync(__dirname + "/../public/download/" + fileName, buffer);
    res.redirect("/download/" + fileName);

});


module.exports = router;