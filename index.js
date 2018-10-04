var express = require('express'),
app = express(),  
server = require('http').createServer(app),  
bodyParser = require('body-parser'),
querystring=require('querystring'),
https=require('https'),
async=require('async'),
restcall=require('./js/restcaller'),
dr=require('./js/dr');

app.use(express.static(__dirname + '/node_modules'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());


var asynccnormalops=(type,name,asyncc)=>{
	
	async.waterfall([
	(asynccnormal)=>{//seggregate opps
	//console.log('i val is '+i.obj);
	switch (type){
	case "DataRaptor":
					dr.drapi(name,asynccnormal);// DR code dr.js
					break;

	}
},
(temp2,asynccnormal)=>{
	var temp1={};
	//console.log('results  '+temp2[0]+ '     '+temp2[1]);
	temp1[temp2[0]]=temp2[1];
	asynccnormal(null,temp1);
},
(temp1,asynccnormal)=>{
	temp1["error"]=[];
	temp1["warning"]=[];
	var recurobjs=(objs)=>{
	for (k in objs){
		if(objs.hasOwnProperty(k)){
			//console.log(k , typeof(objs[k]));
			if(typeof(objs[k])=="object" && k!="error" && k!="warning"){
				console.log('ins obj',k);
				if(objs[k].hasOwnProperty("error")){
					temp1["error"].push.apply(temp1["error"], objs[k]["error"]);
				}
				if(objs[k].hasOwnProperty("warning")){
					temp1["warning"].push.apply(temp1["warning"], objs[k]["warning"]);
				}
				recurobjs(objs[k]);
			}
		}
	}
	};
	recurobjs(temp1);
	asynccnormal(null,temp1);
},
	],(err,res)=>{
	asyncc(null,err?err:res);

});

};

var asyncopps=(webresponse,i)=>{
	//asyncc used is the callback from above step.
	async.waterfall([
(asyncc)=>{//sfdc handshake
	restcall.apihandshake(i.sfdcdetails,asyncc); // code at restcaller.js
},(asyncc)=>{//seggregate opps
	asynccnormalops(i.obj.type,i.obj.name,asyncc);
},
],(err,res)=>{
	webresponse.setHeader('Access-Control-Allow-Origin', '*');
	webresponse.json(err?err:res);
	webresponse.end();

});

}

app.post('/', (req, res,next) =>{  
//username=req.body.username;
console.log(JSON.stringify(req.body));
for (i in req.body){
		i=JSON.parse(i);
		asyncopps(res,i);
		/*res.setHeader('Access-Control-Allow-Origin', '*');
			res.send({'cx':'cxd'});
			res.end();*/
		
	}
});
app.get('/closewindow',(req,res,next)=>{
	console.log(req,req.params,req.body,req.query,process.env.REDIRECT_URI,res.user_id);
	res.end();
});

server.listen(process.env.PORT || 4200);