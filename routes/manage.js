var express = require('express');
var uuid = require('node-uuid');
var router = express.Router();
var multer = require('multer');
var upload = multer()

var db=require("./../db")

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('manage', {
        title: 'Express',
        taskList:db.get("task").value()
    });
});
router.post('/addTask', upload.none(),function(req, res, next) {
    console.log(req.body);
    console.log(new Date(req.body["start-time"]))
    db.get("task").push({
        uid:uuid.v4(),
        name:req.body.name,
        startTime:new Date(req.body["start-time"]).getTime(),
        endTime:new Date(req.body["end-time"]).getTime(),
    }).write();
    res.end("success");
});
router.get('/delete', function(req, res, next) {

    console.log(req.query);

    db.get("task").remove(function(n){
        return n.uid==req.query["uid"];
    }).write();

    res.render('manage', {
        title: 'Express',
        taskList:db.get("task").value()
    });
});

module.exports = router;
