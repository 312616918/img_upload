var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var multer = require('multer');
var upload = multer()

var db = require("./../db")

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('manage', {
        title: 'Express',
        taskList: db.get("task").value()
    });
});
router.post('/addTask', upload.none(), function (req, res, next) {
    console.log(req.body);
    console.log(new Date(req.body["start-time"]))
    db.get("task").push({
        uid: uuid.v4(),
        name: req.body.name,
        startTime: new Date(req.body["start-time"]).getTime(),
        endTime: new Date(req.body["end-time"]).getTime(),
    }).write();
    res.end("success");
});
router.get('/delete', function (req, res, next) {

    console.log(req.query);

    db.get("task").remove(function (n) {
        return n.uid == req.query["uid"];
    }).write();

    res.render('manage', {
        title: 'Express',
        taskList: db.get("task").value()
    });
});

router.post('/uplaodMember', upload.none(), function (req, res, next) {
    var str = req.body["data"];
    console.log(str);
    db.set("member", JSON.parse(str)).write();
    res.end("success");
});

module.exports = router;

// var n =

//     {
//         "1706": ["曹体亮", "顾娇娇", "王佳仪", "高燕", "谢鹏程",
//             "汪冰星", "顾晓东", "丁苏南", "吴倚天", "孙小闯",
//             "唐文杰", "汪航", "苏承研", "谈朱成", "张凯伦",
//             "周嘉辉", "朱政", "杨春明", "吴亦初", "朱亚州",
//             "刘凯", "周朱毅", "张峡荏", "施昌哲", "倪江云",
//             "李心驰", "徐佳晨", "陈雅", "李斌", "严超惠",
//             "陈颖虓", "陈鑫澳"
//         ]
//     }