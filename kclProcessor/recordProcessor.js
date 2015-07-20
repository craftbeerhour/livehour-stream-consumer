
function getInitializer(initActorCallback) {
    return function(initInput, completeCallback) {
        initActorCallback();
        //do some app init stuff here...
        completeCallback();
    };
};

function getProcessRecords(recordActorCallback) {
    return function(processInput, completeCallback) {
        
        if (!processInput || !processInput.records) {
            //get next batch of records if empty
            completeCallback();
            return;
        }
        
        //process record data here..
        var processor = function(records) {
            
            var record = records.pop(),
                sequenceNumber = record.sequenceNumber,
                partitionKey = record.partitionKey, //do i need this ??
                data = new Buffer(record.data, 'Base64').toString();
                
                //process record data ...
                recordActorCallback(data);
                
                return records.length == 0 ? 
                    sequenceNumber : 
                    processor(records);
        },
        lastSeqNum = processor(processInput.records);
        
        processInput.checkpointer.checkpoint(
            lastSeqNum,
            function(error,sn) {
                completeCallback();
            });
    };
}

function getShutdown(shutdownActorCallback) {
    return function(shutdownInput, completeCallback) {
        
        //add shutdown logic here
        shutdownActorCallback();
        
        if (shutdownInput.reason !== 'TERMINATE') {
            completeCallback();
            return;
        }
        
        shutdownInput.checkpointer.checkpoint(function(err) {
          // Error handling logic.
          // Invoke the callback at the end to mark the shutdown
          // operation complete.
          completeCallback();
        });
        
    };
}

exports.recordProcessor = function(
    initActorCallback,
    recordActorCallback,
    shutdownActorCallback
    ) {
        var getInit     = getInitializer(initActorCallback),
        getRecProcessor = getProcessRecords(recordActorCallback),
        getShutdownFuct = getShutdown(shutdownActorCallback);
        
        return {
            initialize: getInit,
            processRecords: getRecProcessor,
            shutdown: getShutdownFuct
        };
};