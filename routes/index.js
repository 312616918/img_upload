var express = require('express');
var router = express.Router();

var multer = require('multer');
var fs = require('fs');
var uuid = require('node-uuid');
var fs = require('fs');

fs.mkdirSync(__dirname+"/../upload_tmp/",{recursive:true});
fs.mkdirSync(__dirname+"/../data/image",{recursive:true});

var upload = multer({
    dest: 'upload_tmp/'
});

var db=require("./../db")

// const low = require('lowdb')
// const FileSync = require('lowdb/adapters/FileSync')

// const adapter = new FileSync(__dirname + '/../data/db.json')
// const db = low(adapter)

// db.defaults({
//         images: {},
//         task:[]
//     })
//     .write()

var classIds = ["1706","1704"];
for(let i in classIds){
    console.log(i);
    fs.mkdirSync(__dirname+"/../data/image/"+classIds[i],{recursive:true});
    if(!db.has("images."+classIds[i]).value()){
        db.set("images."+classIds[i],[]).write();
    }
    // console.log(db.get("image."+classIds[i]).value());
}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('welcome', {
        title: '收截图~~',
        classList:["1706","1704"
        ]
    });
});

router.get('/classid/:classId', function (req, res, next) {
    if (classIds.indexOf(req.params.classId) == -1) {
        res.send("class does not exist!")
        return;
    }
    var lastTask = db.get("task").last().value();
    res.render('index', {
        title: '收截图~~',
        classId: req.params.classId,
        task:lastTask
    });
});


router.post('/upload', upload.any(), function (req, res, next) {
    console.log(req.files[0]); // 上传的文件信息
    // console.log(req);
    var classId = req.body.classId;
    console.log(classId)
    if (classIds.indexOf(classId) == -1) {
        res.send("class does not exist!")
        return;
    }

    db.set("newUpload."+classId,true).write();

    for (var i in req.files) {

        let file=req.files[i];

        var originalname = file.originalname;
        var filePath = classId+"/"+uuid.v4() + originalname.substring(originalname.lastIndexOf('.'));

        fs.renameSync(file.path,__dirname + "/../data/image/" + filePath);
        db.get('images.'+classId)
        .push({
            name:req.body.name,
            path:filePath,
            timestamp:new Date().getTime(),
            label:file.fieldname
        })
        .write()


        // (function (file) {
        //     var originalname = file.originalname;
        //     var filePath = classId+"/"+uuid.v4() + originalname.substring(originalname.lastIndexOf('.'));
        //     fs.readFile(file.path, function (err, data) {
        //         fs.writeFile(__dirname + "/../data/image/" + filePath, data, function (err) {
        //             if (err) {
        //                 console.log(err);
        //             } else {

        //                 db.get('images.'+classId)
        //                 .push({
        //                     name:req.body.name,
        //                     path:filePath,
        //                     timestamp:new Date().getTime(),
        //                     label:file.fieldname
        //                 })
        //                 .write()
        //                 fs.unlinkSync(file.path);
        //             }
        //         });
        //     });
        // })(req.files[i]);

    }
    res.redirect("/info/classId/"+classId);
    // return;


    // var filePath=classId+uuid.v4()+req.files[0].originalname
    // var des_file = __dirname + "/data/image/" + ;
    // fs.readFile(req.files[0].path, function (err, data) {
    //     fs.writeFile(des_file, data, function (err) {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             response = {
    //                 message: 'File uploaded successfully',
    //                 filename: req.files[0].originalname
    //             };
    //             console.log(response);
    //             res.end(JSON.stringify(response));
    //         }
    //     });
    // });
});

module.exports = router;