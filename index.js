var express = require('express'),
app = express(),  
server = require('http').createServer(app),  
bodyParser = require('body-parser'),
helper=require('./js/helper');

app.use(express.static(__dirname + '/node_modules'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());



app.post('/', (req, res,next) =>{  
//username=req.body.username;
console.log(JSON.stringify(req.body));
for (i in req.body){
		i=JSON.parse(i);
		helper.asyncopps(res,i);
		/*res.setHeader('Access-Control-Allow-Origin', '*');
			res.send({'cx':'cxd'});
			res.end();*/
		
	}
});


server.listen(process.env.PORT || 4200);