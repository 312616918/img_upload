const low = require('lowdb')
var fs = require('fs');

fs.mkdirSync(__dirname+"/data/",{recursive:true});
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync(__dirname + '/data/db.json')
const db = low(adapter)


db.defaults({
    images: {},
    task:[],
    timeRecord:{}
})
.write()

module.exports=db;