var express = require('express');
var router = express.Router();
var _ = require('lodash');

var dao = require("./../dao");
const {
    getUnpackedSettings
} = require('http2');
const service = require('../service');


/**
 * 上传信息界面
 */
router.get('/classid/:classId', function (req, res, next) {

    var classId = req.params.classId;
    var lastTask = dao.getLastTask();

    var infoList = dao.getImageList(lastTask,classId);

    var absList = [];
    var memberList = dao.getMember(classId);
    let late=dao.getLateAmount(classId);
    if (memberList) {
        for (let i in memberList) {
            if (_.findIndex(infoList, (s) => {
                    return s.name == memberList[i]
                }) == -1) {
                absList.push({
                    name:memberList[i],
                    late:late[memberList[i]]?late[memberList[i]]:{lateTimes:0,totalTimes:0}
                });
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

/**
 * 下载打包文件
 */
router.get('/download/classid/:classId', function (req, res, next) {
    var classId = req.params.classId;
    service.getPackagePath(classId,(path)=>{
        res.redirect(path);
    })
    // res.redirect();
});

/**
 * 下载报表（旧版）
 */
router.get('/download/classid/:classId/report', function (req, res, next) {

    var classId = req.params.classId;

    service.getReportPath(classId,(path)=>{
        res.redirect(path);
    });

});

router.get('/download/classid/:classId/report2', function (req, res, next) {

    var classId = req.params.classId;
    
    service.getReportPath2(classId,(path)=>{
        res.redirect(path);
    });

});


module.exports = router;