const low = require('lowdb')
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