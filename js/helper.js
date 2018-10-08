
var async=async || require('async'),
restcall=require('./restcaller'),
dr=require('./dr'),
omniscript=require('./omniscript');

var asynccnormalops=(type,name,asyncc)=>{
	
	async.waterfall([
	(asynccnormal)=>{//seggregate opps
	//console.log('i val is '+i.obj);
	switch (type){
	case "DataRaptor":
					dr.drapi(name,asynccnormal);// DR code dr.js
					break;
	case "OmniScript":
	case "Integration_Prodecure":
	case "IntegrationProcedure":omniscript.omniscriptapi(type,name,asynccnormal);
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

};

module.exports.asyncopps=asyncopps;