
var restcall=restcall || require('./restcaller'),
genericfunctions = genericfunctions || require('./genericfunctions'),
async=async || require('async'),
dr=require('./dr');

var typesubtypequery=(name)=>{
	var temp=name.lastIndexOf('_');
	console.log(name.substring(0,temp),name.substring(temp+1,));
	return "select+Id,vlocity_cmt__PropertySet__c+from+vlocity_cmt__OmniScript__c+where+vlocity_cmt__Type__c='"+name.substring(0,temp)+"'+and+vlocity_cmt__SubType__c='"+name.substring(temp+1,)+"'";
};
var omniscriptapi=(bundle,name,asyncc)=>{
	var temp={"type":"","success":[],"error":[],"warning":[]},
	indexval=name.lastIndexOf('_');
	var typ=name.substring(0,indexval);
	var subtyp=name.substring(indexval+1,);
	async.waterfall([
	(omnicallback)=>{
		//restcall.restcallmapperapi(bundle==='IntegrationProcedure' || bundle==='Integration_Prodecure'?typesubtypequery(name):"select+Id,vlocity_cmt__PropertySet__c+from+vlocity_cmt__OmniScript__c+Where+Name='"+name.replace(/\s/g,'+')+"'",omnicallback);//Omniscript Exits
		restcall.restcallmapperapi("select+Id,vlocity_cmt__PropertySet__c+from+vlocity_cmt__OmniScript__c+where+vlocity_cmt__Type__c='"+typ+"'+and+vlocity_cmt__SubType__c='"+subtyp+"'",omnicallback);
	},
	(dt,omnicallback)=>{
		if(dt.error){
			omnicallback("Couldn't Find any "+bundle+" with Given Name: "+name);
		}
		else{
			// Omniscript Naming Convention Start
			if(genericfunctions.namingconventioncheckapi(name)){//Checking Naming Convention
			temp["success"].push("Naming Convention for "+name+" is followed");
			}
			else{
				temp["error"].push("Naming Convention for "+name+" is not followed");
			}
			//Omniscript Naming Convention End
			//Omniscript Active Version query
			restcall.restcallmapperapi("select+Id,vlocity_cmt__PropertySet__c+from+vlocity_cmt__OmniScript__c+Where+vlocity_cmt__Type__c='"+typ+"'+and+vlocity_cmt__SubType__c='"+subtyp+"'+and+vlocity_cmt__IsActive__c=true",omnicallback);
		}
	},
	(dt,omnicallback)=>{
		//Active Version Check Start
		if(dt.error){
			omnicallback("Couldn't Find any Active version"+bundle+" with  Name: "+name);
		}
		else{
			temp["success"].push("Active Version of"+bundle+ " with name "+name+" is Present");
			//Active Version Check End
			//Getting values from vlocity_cmt__Element__c using Omniscript Id
			restcall.restcallmapperapi("select+Name,vlocity_cmt__Type__c,vlocity_cmt__PropertySet__c,vlocity_cmt__Level__c,vlocity_cmt__Active__c,Id+from+vlocity_cmt__Element__c+where+vlocity_cmt__OmniScriptId__c='"+dt.data.records[0].Id+"'+ORDER+BY+vlocity_cmt__Level__c,vlocity_cmt__Order__c",omnicallback);
		}
	},
	(dt,omnicallback)=>{
		//Omniscript Element Check Start
		if(dt.error){
			omnicallback("Couldn't Any Elements for "+bundle+" with  Name: "+name+ " Fill the omniscript with atleast one item");
		}
		else{
							var sample={};
							var i1=0,i2=0,resp=dt.data,valholder=[],ops=[];
							for (var i=0;i<resp.records.length;i++){
								if(resp.records[i]["vlocity_cmt__Active__c"]){
								sample[resp.records[i].Name]=true;
								propset=JSON.parse(resp.records[i]["vlocity_cmt__PropertySet__c"]);
								switch(resp.records[i]["vlocity_cmt__Type__c"]){
									case "Response Action":i1+=1;break;
									case "Step":i2+=1;break;
									case "OmniScript":
													//valholder=omniscriptapi('OmniScript',resp.records[i].Name);
													//temp[valholder[0]]=valholder[1];
													ops.push(['OmniScript',resp.records[i].Name]);
													break;
									case "Integration Procedure Action":
													//valholder=omniscriptapi('IntegrationProcedure',propset.integrationProcedureKey);
													//temp[valholder[0]]=valholder[1];
													ops.push(['IntegrationProcedure',resp.records[i].Name]);
												break;
									case "Remote Action":
														
														if(propset.responseJSONNode && sample[propset.responseJSONNode]===undefined && propset.responseJSONNode!="vlcCart"){//Check for persistent component should be made dynamic
															//Saving response JSON Node Name for Refrencing in Selectable Items
															sample[propset.responseJSONNode]=false;
														}
														if(propset.preTransformBundle|| propset.postTransformBundle){
															valholder=drapi(propset.preTransformBundle!==""?propset.preTransformBundle:propset.postTransformBundle);
															temp[valholder[0]]=valholder[1];
														}
														break;
									case "DataRaptor Extract Action":
									case "DataRaptor Post Action":
									case "DataRaptor Transform Action":
																if(propset.bundle){
																	//valholder=drapi(propset.bundle);
																	//temp[valholder[0]]=valholder[1];
																	ops.push(['DR',propset.bundle]);
																}
																break;
								}
							}
							}
							if (i2===0){
								//Chekcing for Response Action
								if(i1===0){
									temp["error"].push("There is no Response Action for "+bundle+ " with name "+name);
								}
								else{
									temp["success"].push(" Response Action for "+bundle+ " with name "+name+" is present");
								}
							}
							for (i in sample){
								//console.log(sample[i],i);
								if (sample.hasOwnProperty(i) && sample[i]===false){
									temp["error"].push("The JSON Node "+ i +" is not existing but used in Remote Action for "+bundle+ " with name "+name);
									console.log(i,' is not existing but used');
								}
								/* else{
									client.emit('objjobs','Checked Node'+i);
								} */
							}
							omnicallback(null,ops);
		}
	},
	(ops,omnicallback)=>{
		if (ops.length === 0)
			omnicallback(null)
		for(let i=0;i<ops.length;i++){
			async.waterfall([
				(opscallback)=>{
					switch(ops[i][0]){
						case 'OmniScript':
						case 'IntegrationProcedure':omniscriptapi('OmniScript',ops[i][1],opscallback);
						break;
						default: dr.drapi(ops[i][1],opscallback);break;
						
					}
				},
				(valholder,opscallback)=>{
						//console.log('results  '+temp2[0]+ '     '+temp2[1]);
						temp[valholder[0]]=valholder[1];
						if(i==ops.length-1)
							omnicallback(null);
				}
			
			],(err,res)=>{
				
			})
		}
	}
	],(err,res)=>{
		if(err){
		temp["error"].push(err);}
		asyncc(null,[name,temp]);
	});
	
};

module.exports.omniscriptapi=omniscriptapi;
