var namingconventioncheckapi=(name)=>{//Checking Naming Convention
			
	name.match("^([A-Z]+[a-z_0-9]*)+$")?true:false;
}

module.exports.namingconventioncheckapi=namingconventioncheckapi;