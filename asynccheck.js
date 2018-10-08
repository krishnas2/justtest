var async=async || require('async');
async.series([(callbackhandler)=>{
callbackhandler(null,['q',{'e':'fggg'}]);
}, 
  (callbackhandler)=>{
  callbackhandler(null,['qq',{'ew':'wewdw'}]);
  }], function(err, results){
    console.log('Result of the whole run is ' + results);
})