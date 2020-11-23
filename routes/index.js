var express = require('express');
var router = express.Router();

var multer = require('multer');
var fs = require('fs');
var uuid = require('node-uuid');
var fs = require('fs');
var dao=require("./../dao")
var service=require("../service");

var upload = multer({
    dest: 'upload_tmp/'
});


/**
 * 欢迎页
 */
router.get('/', function (req, res, next) {
    res.render('welcome', {
        title: '收截图~~',
        classList:dao.getClassList()
    });
});

/**
 * 上传界面
 */
router.get('/classid/:classId', function (req, res, next) {
    let classIds=dao.getClassList();

    //驳回不存在的班级
    if (classIds.indexOf(req.params.classId) == -1) {
        res.send("class does not exist!")
        return;
    }

    var lastTask = dao.getLastTask();
    res.render('index', {
        title: '收截图~~',
        classId: req.params.classId,
        task:lastTask
    });
});

/**
 * 上传请求
 */
router.post('/upload', upload.any(), function (req, res, next) {
    // console.log(req.files[0]); // 上传的文件信息
    // console.log(req);

    let classIds=dao.getClassList();

    var classId = req.body.classId;


    if (classIds.indexOf(classId) == -1) {
        res.send("class does not exist!")
        return;
    }

    //姓名过长
    if(req.body.name.length>20){
        res.render("penalty");
        return;
    }

    dao.setNewUplaod(classId);

    for (var i in req.files) {

        let file=req.files[i];

        //文件过大
        if(file.size>10*1024*1024){
            for(var x in req.file){
                fs.unlinkSync(req.files[x].path);
            }
            res.render("penalty");
            return;
        }

        var originalname = file.originalname;
        var filePath = classId+"/"+uuid.v4() + originalname.substring(originalname.lastIndexOf('.'));
        fs.renameSync(file.path,__dirname + "/../data/image/" + filePath);

        /**
         * @type ImageRecord
         */
        let record={
            name:req.body.name,
            path:filePath,
            timestamp:new Date().getTime(),
            label:file.fieldname
        };

        dao.addImageRocord(classId,record);
    }

    res.send("success");
});

module.exports = router;