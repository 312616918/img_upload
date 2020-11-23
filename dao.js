const low = require('lowdb')
var fs = require('fs');

fs.mkdirSync(__dirname + "/data/", {
    recursive: true
});
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(__dirname + '/data/db.json')
const db = low(adapter)


db.defaults({
        images: {},
        task: [],
        timeRecord: {},
        newUpload: {}
    })
    .write()

module.exports = {

    /**
     * 数据库本体，便于直接操作，兼容旧方法
     */
    db: db,
    /**
     * 获取最后一个上传任务
     * @returns Task
     */
    getLastTask: function () {

        //@ts-ignore
        let lastTask = db.get("task").last().value();

        return lastTask;
    },

    /**
     * 获取classId班级在task下的全部上传记录
     * @param {Task} task 
     * @param {string} classId 
     * @returns {ImageRecord[]}
     */
    getImageList: function (task, classId) {

        //@ts-ignore
        return db.get("images." + classId).filter(function (s) {
            return s.timestamp > task.startTime && s.timestamp < task.endTime;
        }).value();
    },

    /**
     * @param {string} classId
     * @param {ImageRecord} record
     */
    addImageRocord: function (classId, record) {

        // @ts-ignore
        db.get('images.' + classId).push(record).write();
    },

    /**
     * 获取某班级的全部成员
     * @param {string} classId 
     * @returns {string[]}
     */
    getMember: function (classId) {
        return db.get("member." + classId).value();
    },

    getClassList: function () {
        let res = [];
        let member = db.get("member").value();
        for (let id in member) {
            res.push(id);
        }
        //暂时逆序，6班优先，（￣︶￣）↗　
        res.reverse();
        return res;
    },

    /**
     * 为新班级添加班级image列表
     * 
     */
    refresh: function () {
        let classIds = this.getClassList();
        for (let i in classIds) {
            if (!db.has("images." + classIds[i]).value()) {
                db.set("images." + classIds[i], []).write();
            }
        }
    },

    /**
     * 设置新上传标志，没有新上传不重新打包
     * @param {string} classId
     */
    setNewUplaod: function (classId) {
        db.set("newUpload." + classId, true).write();

    },

    /**
     * 获取新上传标志，没有新上传不重新打包
     * @param {string} classId
     * @returns {boolean}
     */
    getNewUpLoad: function (classId) {
        var newUploadKey = "newUpload." + classId;
        if (!db.has(newUploadKey).value()) {
            db.set(newUploadKey, true).write();
        }
    
        return db.get(newUploadKey).value();
    },

    /**
     * 
     * @param {string} classId 
     * @returns {Late}
     */
    getLateAmount:function(classId){

        /**
         * @type Late
         */
        let res={};


        /**
         * @type Task[]
         */
        let tasks=db.get("task").value();

        let offset=new Date().getTimezoneOffset();

        for(let i in tasks){
            let t=tasks[i];
            let images= this.getImageList(t,classId);
            

            for(let i in images){
                let img=images[i];
                if(res[img.name]==undefined){
                    res[img.name]={
                        lateTimes:0,
                        totalTimes:0
                    }
                }
                let d= new Date(img.timestamp+(offset+480)*60*1000);
                if(d.getDay()>=3){
                    if(d.getHours()>=17){
                        res[img.name].lateTimes+=1;
                    }
                }
            }
        }
        for(let name in res){
            let r=res[name];
            r.totalTimes=tasks.length;
            r.lateTimes/=2;
        }
        return res;
    }

};