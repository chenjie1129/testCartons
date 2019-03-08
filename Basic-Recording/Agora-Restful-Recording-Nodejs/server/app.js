const express = require('express')
const app = express()
const port = 3000
const RecordManager = require('./recordManager')
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');
const https = require('https')
const cors = require('cors');
const dynamicKey5 = require('./dynamicKey5').generateMediaChannelKey
//const timeout = require('connect-timeout')
//app.all('*', function(req, res, next) {
   // res.header("Access-Control-Allow-Origin", "*");
  //  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//    res.header("X-Powered-By",' 3.2.1');
//    res.header("Access-Control-Allow-Headers", "cache-control");
  //  next();
//});
var privateKey = fs.readFileSync('/etc/nginx/1859288_www.cartons.top.key').toString();
var certificate = fs.readFileSync('/etc/nginx/1859288_www.cartons.top.pem').toString();
//var ca = fs.readFileSync('./ssl/certrequest.csr').toString();

var options = {key:privateKey,cert:certificate};
app.use(cors());

app.use(bodyParser.json());

var httpsServer = https.createServer(options, app);
httpsServer.listen(2443);
app.get('/hello_world', function(req,res) {
    res.send('hello');
});

app.post('/get_dk5',(req,res,next)=>{
let {body} = req;
  let unixTs = Math.floor(Number(new Date())/1000);
  let rand = Math.floor(Math.random() * 0xFFFFFFFF);
  let { appId, appCert, channelName, uid, expiredTs } = body;
  let token = dynamicKey5(appId, appCert, channelName, unixTs, rand, uid, expiredTs);
  console.log(`Incoming dk 5 request appId ${appId} appCert ${appCert} channel ${channelName} currentTs ${unixTs} uid ${uid} expiredTs ${expiredTs}`);
  console.log(token);
res.json({
    success: true,
    token,
    currentTime: unixTs,
    expiredTs: expiredTs
  });

});

app.post('/get_token',(req,res,next)=>{
var SimpleTokenBuilder = require('./SimpleTokenBuilder').SimpleTokenBuilder;
var Role = require('./SimpleTokenBuilder').Role;
var Priviledges = require('./AccessToken').priviledges;
let{body} = req;
let{appId, appCert, channelName, uid,expiredTs,privilege} = body;
var atoken = "hello Token";
//var appID  = "970CA35de60c44645bbae8a215061b33";
//var appCertificate     = "5CFd2fd1755d40ecb72977518be15d3b";
//var channel = "7d72365eb983485397e3e3f9d460bdda";
//var uid = 2882341273;
var builder = new SimpleTokenBuilder(appId, appCert, channelName, uid);
switch(privilege) {
  case "0":
    // code block
// for communication
	builder.initPrivileges(Role.kRoleAttendee);
	builder.setPrivilege(Priviledges.kJoinChannel, expiredTs);
	builder.setPrivilege(Priviledges.kPublishAudioStream, expiredTs);
	builder.setPrivilege(Priviledges.kPublishVideoStream, expiredTs);
	builder.setPrivilege(Priviledges.kPublishDataStream, expiredTs);
	aToken = builder.buildToken();
    break;
  case "1":
    // code block
// for broadcaster
        builder.initPrivileges(Role.kRoleAttendee);
        builder.setPrivilege(Priviledges.kJoinChannel, expiredTs);
        builder.setPrivilege(Priviledges.kPublishAudioStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishVideoStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishDataStream, expiredTs);
        aToken = builder.buildToken();
    break;
case "2":
        builder.initPrivileges(Role.kRoleAttendee);
        builder.setPrivilege(Priviledges.kJoinChannel, expiredTs);
        builder.setPrivilege(Priviledges.kPublishAudioStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishVideoStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishDataStream, expiredTs);
        aToken = builder.buildToken();
break;
case "101":
        builder.initPrivileges(Role.kRoleAttendee);
        builder.setPrivilege(Priviledges.kJoinChannel, expiredTs);
        builder.setPrivilege(Priviledges.kPublishAudioStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishVideoStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishDataStream, expiredTs);
        aToken = builder.buildToken();
break;
  default:
    // code block
        builder.initPrivileges(Role.kRoleAttendee);
        builder.setPrivilege(Priviledges.kJoinChannel, expiredTs);
        builder.setPrivilege(Priviledges.kPublishAudioStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishVideoStream, expiredTs);
        builder.setPrivilege(Priviledges.kPublishDataStream, expiredTs);
        aToken = builder.buildToken();
}

res.json({
    success: true,
    aToken,
    expiredTs: expiredTs
  });


//var builder = new SimpleTokenBuilder(appId, appCert, channelName, uid);

//builder.initPrivileges(Role.kRoleAttendee);
//builder.setPrivilege(Priviledges.kJoinChannel, expireTs);
//builder.setPrivilege(Priviledges.kPublishAudioStream, expireTs);
//builder.setPrivilege(Priviledges.kPublishVideoStream, expireTs);
//builder.setPrivilege(Priviledges.kPublishDataStream, expireTs);

//var token = builder.buildToken();







});


app.post('/recorder/v1/start', (req, res, next) => {
    let { body } = req;
    let { appid, channel, key, streamType } = body;
	var initStreamType = "0";
    if (!appid) {
        throw new Error("appid is mandatory");
    }
    if (!channel) {
        throw new Error("channel is mandatory");
    }
	if (streamType){
		initStreamType = streamType;	
	}

    RecordManager.start(key, appid, channel,initStreamType).then(recorder => {
        //start recorder success
        console.log(initStreamType);
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
