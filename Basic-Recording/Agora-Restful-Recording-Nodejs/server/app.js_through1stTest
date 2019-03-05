const express = require('express')
const app = express()
const port = 3000
const RecordManager = require('./recordManager')
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');
const cors = require('cors')
//const timeout = require('connect-timeout')
//app.all('*', function(req, res, next) {
   // res.header("Access-Control-Allow-Origin", "*");
  //  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//    res.header("X-Powered-By",' 3.2.1');
//    res.header("Access-Control-Allow-Headers", "cache-control");
  //  next();
//});
app.use(cors());

app.use(bodyParser.json());
app.post('/recorder/v1/start', (req, res, next) => {
    let { body } = req;
    let { appid, channel, key } = body;
    if (!appid) {
        throw new Error("appid is mandatory");
    }
    if (!channel) {
        throw new Error("channel is mandatory");
    }

    RecordManager.start(key, appid, channel).then(recorder => {
        //start recorder success
        res.status(200).json({
            success: true,
            sid: recorder.sid
        });
    }).catch((e) => {
        //start recorder failed
        next(e);
    });
})

app.post('/recorder/v1/stop',  (req, res, next) => {
    let { body } = req;
    let { sid } = body;
    if (!sid) {
        throw new Error("sid is mandatory");
    }

    RecordManager.stop(sid);
    res.status(200).json({
        success: true
    });
})
app.post('/fetch',(req,res,next)=>{

	let {body} = req;
	let {sid} = body;
	if(!sid){
		throw new Error("sid is mandatory");
	}
	console.log(sid);
	fs.readdir(`./output/${sid}`,function(err,files){
console.log(err,files);
		if(err){
			res.status(404).json({sid, state: 'this_sid_has_no_mp4'});
			return console.error(err);
		}
		var mp4 = files.filter(e=>/\.mp4/.test(e));
		if(mp4){
			console.log('host',req.host);
			res.status(200).json(mp4.map(e=>`${req.host}:3000/static/${sid}/${e}`));
			console.log(mp4);
		}else{
			res.status(404).json({sid, state: 'this_sid_has_no_mp4'});
		}

	});
})
app.use( (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        success: false,
        err: err.message || 'generic error'
    })
})
app.use('/static',express.static(path.join(__dirname,'output')))
app.listen(port)
