
var kcl = require('aws-kcl'),
    getRecordProcessor = require("./kclProcessor/recordProcessor.js");

var processor = getRecordProcessor.recordProcessor(
    function(){},
    function(data){
        var tweet = JSON.parse(data);
        console.log(tweet.text);
    },
    function(){}
);

kcl(processor).run();