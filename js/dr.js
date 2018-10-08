
var restcall=restcall || require('./restcaller'),
genericfunctions = genericfunctions || require('./genericfunctions'),
async=async || require('async');


var drapi=(name,asyncc)=>{
	var temp={"type":"","success":[],"error":[],"warning":[]};
async.waterfall([
(drapic)=>{
restcall.restcallmapperapi("select+Id,vlocity_cmt__Type__c,vlocity_cmt__OutputType__c,vlocity_cmt__UseAssignmentRules__c,vlocity_cmt__CheckFieldLevelSecurity__c,vlocity_cmt__SampleInputJSON__c+from+vlocity_cmt__DRBundle__c+where+Name+=+'" + name.replace(/\s/g, '+') + "'", drapic);//DR Exits or not
},
(dt,drapic)=>{
	if (dt.error){
		drapic("Couldn't Find any DataRaptor with Given Name: "+name);
	}
	else{
		// DR Naming Convention Start
		//console.log("naming + "+genericfunctions.namingconventioncheckapi(name)+ "   "+name);
		if(genericfunctions.namingconventioncheckapi(name)){//Checking Naming Convention
		temp["success"].push("Naming Convention for "+name+" is followed");
		}
		else{
			temp["error"].push("Naming Convention for "+name+" is not followed");
		}
		//DR Naming Convention End
		//dt.data.records
		//Capturing Type 
		temp.type=dt.data.records[0]['vlocity_cmt__Type__c'];
		switch(temp.type){
		case "Extract":
		case "Extract (JSON)":
						//Sample Input JSON DR Preview Start
						if(genericfunctions.isEmpty(JSON.parse(dt.data.records[0]['vlocity_cmt__SampleInputJSON__c']))){
							temp["error"].push("Sample Input JSON for "+name+" is NULL,Execute DR preview atleast once for valid value");
						}
						else{
							temp["success"].push("Sample Input JSON for "+name+" is Not NULL");
						}
						//Sample Input JSON DR Preview End
						//Checking FieldLevel Security Checkbox Start
						if(dt.data.records[0]["vlocity_cmt__CheckFieldLevelSecurity__c"]===true){
							temp["success"].push("FieldLevel Security Checkbox "+name+" is Checked");
						}
						else{
							temp["error"].push("FieldLevel Security Checkbox "+name+" is not Checked");
						}
						//Checking FieldLevel Security Checkbox End
						//Query for getting Required Vals Start
						restcall.restcallmapperapi("select+vlocity_cmt__FilterOperator__c,vlocity_cmt__FilterValue__c,vlocity_cmt__FilterGroup__c,vlocity_cmt__InterfaceFieldAPIName__c,vlocity_cmt__InterfaceObjectName__c,vlocity_cmt__DomainObjectFieldAPIName__c+from+vlocity_cmt__DRMapItem__c+where+Name=+'"+name.replace(/\s/g,'+')+"'",drapic);
						//Query for getting Required Vals End
						break;
		case "Load":
						//Checking Assignement Rules Start
						if(dt.data.records[0]["vlocity_cmt__OutputType__c"]==="SObject"){
							if(dt.data.records[0]["vlocity_cmt__UseAssignmentRules__c"]===true ){
								temp["success"].push("Assignement Rules Checkbox "+name+" is Checked");
							}
							else{
								temp["warning"].push("Assignement Rules Checkbox "+name+" is not Checked");
							}
						}
						//Checking Assignement Rules End
						//Query for getting Required Vals Start
						restcall.restcallmapperapi("select+vlocity_cmt__DomainObjectFieldAPIName__c,vlocity_cmt__DomainObjectAPIName__c,vlocity_cmt__UpsertKey__c+from+vlocity_cmt__DRMapItem__c+where+Name=+'"+name.replace(/\s/g,'+')+"'",drapic);
						//Query for getting Required Vals End
						break;
			default:
			drapic(null,null);
		}
	}
},(dt,drapic)=>{
	if(!dt)
		drapic(null,null)
	else{
		//DR query may be correct but to perform any operation no records returned . Please Fill some fields and excute the task again
		switch(temp.type){
		case "Extract":
		case "Extract (JSON)":
					if (dt.error){
							drapic("DR query may be correct but to perform any operation no records returned . Please Fill some fields and excute the task again for DataRaptor with Given Name: "+name);
						}
					else{
							// Extract DR perform Operations Start
								var sample={},
								holder={},
								extracrtdrtemp=[],
								a='',b='',lis=dt.data.records,q=[];
								for (var i=0;i<lis.length;i++){
											if(lis[i]['vlocity_cmt__FilterOperator__c'] !=null){
												a=lis[i]["vlocity_cmt__InterfaceObjectName__c"];
												b=lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"];
												holder[lis[i]["vlocity_cmt__DomainObjectFieldAPIName__c"]]=a;
											}
											if(b && !b.match(/\[/i)){
											if(sample.hasOwnProperty(a)){
													if(!sample[a].match(b)){
													sample[a]+=','+b;}
												}
												else{
													sample[a]=b;
												}
											}
										}
								for (var i=0;i<lis.length;i++){
											if(lis[i]['vlocity_cmt__FilterOperator__c'] ===null && lis[i]['vlocity_cmt__DomainObjectFieldAPIName__c']!=="Formula"){
												//console.log(lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"],lis[i]);
												try{
												//console.log(lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"],lis[i]);
												var extracrtdrtemp=lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"].lastIndexOf(":");
												if (extracrtdrtemp!==-1){
												a=holder[lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"].substring(0,extracrtdrtemp)];
												b=lis[i]["vlocity_cmt__InterfaceFieldAPIName__c"].substring(extracrtdrtemp+1,);}
												}
												catch(e){
													temp["error"].push("Issue with current JSON Node of "+name+" JSON is "+JSON.stringify(lis[i],null,2));
												}
											}
											if(b && !b.match(/\[/i)){
											if(sample.hasOwnProperty(a)){
													if(!sample[a].match(b)){
													sample[a]+=','+b;}
												}
												else{
													sample[a]=b;
												}
											}
										}
								//console.log(sample,holder);
								 for (i in sample){
									console.log('fdf',i);
									if(sample.hasOwnProperty(i)){
										console.log('select+'+sample[i]+'+from+'+i+'+LIMIT+1');
										if(q.indexOf('select+'+sample[i]+'+from+'+i+'+LIMIT+1')==-1){
										q.push('select+'+sample[i]+'+from+'+i+'+LIMIT+1');}
									//RestCallMapper(tempquery,'DRqueries',null,client);
									}
								}
								//Execute REST Call for each Start
								//async.map(q, (val,childcallback)=>{//WIP
									//restcall.restcallmapperapi(val,childcallback);
								//}, (err,result)=>{
									// i want result of each call
								//});
								// Execute REST Call for Each End
								//q.push('select+Idddd,Nameee+from+Account+LIMIT+1');
								//q.push('select+kkj+from+Contact+LIMIT+1');
								restcall.getData(q).then(allData => {
									// allData is array of results
									allData.map(item => {
										if(item){
											console.log(item);
											temp["error"].push(item);
										}
										
										//temp["error"].push(item);
										//temp["error"].push.apply(temp["error"], item)
									});
									drapic(null,null);
								}).catch(err => {
									temp["error"].push(err);
									drapic(null,null);
								});
							// Extract DR Perform Operations End
					}
					break;
		case "Load":drapic(null,null);
						break;
	}
	
}
}
],(err,res)=>{
	if(err){
		temp["error"].push(err);}
		//temp["error"].push('some test');
	asyncc(null,[name,temp]);
});
};

module.exports.drapi=drapi;