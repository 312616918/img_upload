var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var multer = require('multer');
var JSZip = require("jszip");
var fs = require("fs");
var _ = require('lodash');

fs.mkdirSync(__dirname+"/../public/download/",{recursive:true});
var upload = multer()

var db = require("./../db");
const { getUnpackedSettings } = require('http2');

router.get('/classid/:classId', function (req, res, next) {

    var classId = req.params.classId;
    var lastTask = db.get("task").last().value();

    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();

    var absList=[];
    var memberList=db.get("member."+classId).value();
    if(memberList){
        for(let i in memberList){
            if(_.findIndex(infoList,(s)=>{
                return s.name==memberList[i]
            })==-1){
                absList.push(memberList[i]);
            }
        }
    }

    res.render('info', {
        title: '收截图~~',
        classId:classId,
        infoList: infoList,
        absList:absList,
        task:lastTask
    });
});

router.get('/download/classid/:classId', function (req, res, next) {

    var classId = req.params.classId;
    var newUploadKey="newUpload."+classId;

    if(!db.has(newUploadKey).value()){
        db.set(newUploadKey,true).write();
    }
    
    var newUpload=db.get(newUploadKey);
    if(!newUpload){
        var fileName=classId+" "+lastTask.name+".zip";
        res.redirect("/download/"+fileName);
        return;
    }




    var lastTask = db.get("task").last().value();

    var infoList = db.get("images." + classId).filter(function (s) {
        return s.timestamp > lastTask.startTime && s.timestamp < lastTask.endTime;
    }).value();
    
    var zip = new JSZip();
    for (var i in infoList) {
        var filePath=infoList[i].path;
        var fileName=infoList[i].name+"-"+(infoList[i].label=="info-img"?"信息界面":"完成界面")+"-"+infoList[i].timestamp+filePath.substring(filePath.lastIndexOf('.'));
        
        zip.file(infoList[i].name + "/" + fileName, fs.readFileSync(__dirname + "/../data/image/" + infoList[i].path));

    }

    // zip.generateNodeStream({
    //         type: 'nodebuffer',
    //         streamFiles: true
    //     })
    //     .pipe(fs.createWriteStream('out.zip'))
    //     .on('finish', function () {
    //         // JSZip generates a readable stream with a "end" event,
    //         // but is piped here in a writable stream which emits a "finish" event.
    //         console.log("out.zip written.");
    //     });
    zip.generateAsync({ //设置压缩格式，开始打包
        type: "nodebuffer", //nodejs用
        compression: "DEFLATE", //压缩算法
        compressionOptions: { //压缩级别
            level: 9
        }
    }).then(function (content) {
        // console.log(infoList);
        var fileName=classId+" "+lastTask.name+".zip";
        fs.writeFileSync(__dirname+"/../public/download/"+fileName, content); //将打包的内容写入 当前目录下的 result.zip中
        db.set(newUploadKey,false).write();
        res.redirect("/download/"+fileName);
    });





    // res.end("success");
});


module.exports = router;