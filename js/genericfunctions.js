var namingconventioncheckapi=(name)=>{//Checking Naming Convention
	//console.log("naming convention for "+ name+"  "+ name.match("^([A-Z]+[a-z_0-9]*)+$"));
	return name.match("^([A-Z]+[a-z_ 0-9]*)+$")?true:false;
};
var isEmpty = (obj)=> {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
};

module.exports.namingconventioncheckapi=namingconventioncheckapi;
module.exports.isEmpty=isEmpty;