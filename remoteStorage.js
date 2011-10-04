(function() {
  if(!window.remoteStorage) {//shim switch
      //////////////////
     // stub backend //
    //////////////////

    var backend = (function(){
      return {
        clear: function(cb) {
          alert('backend clearing');
          cb();
        },
        setItem: function(key, value, revision, cb) {
          alert('backend setting item "'+key+'" to "'+value+'" revision '+revision);
          cb(revision);
        },
        removeItem: function(key, revision, cb) {
          alert('backend removing item "'+key+'" revision '+revision);
          cb(revision);
        },
        connect: function(userAddress, cb) {
          alert('connecting to '+userAddress);
          cb();
        }
      }
    })()
      
      ///////////////////////////
     // remoteStorage backend //
    ///////////////////////////

    var backend = (function(){
      return {
        clear: function(cb) {
          //alert('backend clearing');
          cb();
        },
        setItem: function(key, value, revision, cb) {
          //alert('backend setting item "'+key+'" to "'+value+'" revision '+revision);
          cb(revision);
        },
        removeItem: function(key, revision, cb) {
          //alert('backend removing item "'+key+'" revision '+revision);
          cb(revision);
        },
        connect: function(userAddress, cb) {
          alert('connecting to '+userAddress);
          cb();
        }
      }
    })()

    window.remoteStorage = (function(){
      function work(minRevision) {
        var queue = JSON.parse(localStorage.getItem('_remoteStorageActionQueue'));
        if(queue.length) {
          var thisAction = queue.shift();
          while(thisAction.revision<minRevision) {
            thisAction = queue.shift();
            if(!queue.length) {
              localStorage.setItem('_remoteStorageActionQueue', '[]');
              return;
            }
          }
          queue.unshift(thisAction);
          localStorage.setItem('_remoteStorageActionQueue', JSON.stringify(queue));
          if(thisAction.action == 'clear') {
            backend.clear(function() {work(1);});
          } else if(thisAction.action == 'setItem') {
            backend.setItem(thisAction.key, thisAction.value, thisAction.revision, function(revision) {work(revision+1);});
          } else if(thisAction.action == 'removeItem') {
            backend.removeItem(thisAction.key, thisAction.revision, function(revision) {work(revision+1);});
          }
        }
      }
      function pushAction(action) {
        var queue = JSON.parse(localStorage.getItem('_remoteStorageActionQueue'));
        if(queue==null){
          queue=[];
        }
        action.revision = new Date().getTime();
        queue.push(action);
        localStorage.setItem('_remoteStorageActionQueue', JSON.stringify(queue));
      }
      return {
        length: localStorage.length,
        userAddress: 'user@island',
        connected: false,
        getItem: function(k) {
          return localStorage.getItem('_remoteStorage_'+k);
        },
        setItem: function(k,v) {
          pushAction({action: 'setItem', key: k, value: v}, this.connected);
          if(this.connected) {
            work();
          }
          var ret = localStorage.setItem('_remoteStorage_'+k, v);
          this.length = localStorage.length;
          return ret;
        },
        removeItem: function(k) {
          pushAction({action: 'removeItem', key: k});
          if(this.connected) {
            work();
          }
          var ret = localStorage.removeItem('_remoteStorage_'+k);
          window.remoteStorage.length = localStorage.length;
          return ret;
        },
        clear: function() {
          localStorage.setItem('_remoteStorageActionQueue', '[{"action": "clear"}]');
          if(this.connected) {
            work();
          }
          for(var i=0;i<localStorage.length;i++) {
            if(localStorage.key(i).substring(0,15)=='_remoteStorage_') {
              localStorage.removeItem(localStorage.key(i));
            }
          }
        },
        setUserAddress: function(userAddress) {
          backend.connect(userAddress, function() {
            this.userAddress = userAddress;
            this.connected = true;
            work();
          })
        }
      }
    })()
  }
})()
