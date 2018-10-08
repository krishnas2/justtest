
var querystring=querystring || require('querystring'),
https= https || require('https'),
username='',
access_token='',
instance_url='',
squery='/services/data/v42.0/query/?q=';
const rp = require('request-promise');
async function getData(array) {
    let results = [];
    var headers= {
        'Content-Type':'application/json',
        'Authorization':access_token
    };

    for (let item of array) {
        let newOptions={
            port:null,
			url:'https://'+instance_url+squery+item,
            method:'GET',
            headers:headers
        };

        let data = await rp(newOptions).then(r=>{
			
			console.log(r);
			return null;
		}).catch(e => {
			//console.log(e.message);
            return e.message;
            // if error, make data be null and continue processing
            //return null;
        });
        results.push(data);
    }
    return results;
}
var apihandshake= (data,asyncc)=>{
	         //console.log('sfdc',data);
		   console.log('came here1');
	var headers={
		'Content-Type':'application/json'
	},
	dat={
		'grant_type':'password',
		'client_id':data.clientid,
		'client_secret':data.clientsecret,
		'username':data.username,
		'password':data.password
	};
	var host=data.env=="Production"?'login.salesforce.com':'test.salesforce.com',
	endpoint = '/services/oauth2/token?'+querystring.stringify(dat);
	//console.log(dat['client_id'],dat['username'],dat['password']);
	var options={
		host:host,
		port:null,
		path:endpoint,
		method:'POST',
		headers:headers
	};
	console.log('came hhh');
	var req=https.request(options,function(res){
		res.setEncoding('utf-8');
		var responseString='';
		res.on('data',function(respObj){
			responseString+=respObj;
		});
		res.on('end',function(){
			try{
			//console.log('rstring',responseString);
			var responseObject=JSON.parse(responseString);
			access_token=responseObject.token_type+' '+responseObject.access_token;
			instance_url=responseObject.instance_url.split('/')[2];
			if(access_token){
				console.log('connection'+'established');
				asyncc(null);
			}
			}
			catch(e){

				console.log('error',e);
				asyncc('error in response '+e);
			}
		});
		
	});
	req.on('error',(e)=>{
		console.log('problem'+e);
		asyncc('error in request '+e);
	});
	req.end();
	
};

var restcallmapperapi=(query,callback)=>{
	var temp={"error":false};
	var headers={
		'Content-Type':'application/json',
		'Authorization':access_token
	};
	var newOptions={
		host:instance_url,
		port:null,
		path:squery+query,
		method:'GET',
		headers:headers
	};
	//console.log('query',instance_url,newOptions.path);
	var qryObj=https.request(newOptions,function(result){
		result.setEncoding('utf-8');
		var responseString1='';
		result.on('data',function(respObj){
			responseString1+=respObj;
		});
		result.on('end',function(){
			var resp=JSON.parse(responseString1);
			//console.log('respo',resp.done,resp.totalSize,resp);
			if(resp.done && resp.totalSize>0){
				temp["data"]=resp;
			}
			else{
				temp["error"]=true;
			}
			callback(null,temp);
		});
	});
	qryObj.on('error',(e)=>{
		console.log('problemquery',e);
		callback('error in query object request '+e);
	});
	qryObj.end();
};

module.exports.apihandshake=apihandshake;
module.exports.restcallmapperapi=restcallmapperapi;
module.exports.access_token=access_token;
module.exports.instance_url=instance_url;
module.exports.getData=getData;