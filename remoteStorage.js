(function() {
  if(!window.remoteStorage) {
    window.remoteStorage = (function(){
      function pushAction(action) {
        var oldQueue = localStorage.getItem('_remoteStorageActionQueue');
        if(oldQueue==null){
          oldQueue=[];
        }
        localStorage.setItem('_remoteStorageActionQueue', oldQueue.push(action));
      }
      return {
        length: localStorage.length,
        userAddress: 'user@island',
        connected: false,
        working: false,     
        getItem: function(k) {
          return localStorage.getItem('_remoteStorage_'+k);
        },
        setItem: function(k,v) {
          pushAction({action: 'setItem', key: k, value: v});
          var ret = localStorage.setItem('_remoteStorage_'+k, v);
          this.length = localStorage.length;
          return ret;
        },
        removeItem: function(k) {
          pushAction({action: 'removeItem', key: k});
          var ret = localStorage.removeItem('_remoteStorage_'+k);
          window.remoteStorage.length = localStorage.length;
          return ret;
        },
        clear: function() {
          localStorage.setItem('_remoteStorageActionQueue', '[{"action": "clear"}]');
          for(var i=0;i<localStorage.length;i++) {
            if(localStorage.key(i).substring(0,15)=='_remoteStorage_') {
              localStorage.removeItem(localStorage.key(i));
            }
          }
        },
        setUserAddress: function(userAddress) {
          alert('fake setting user address "'+userAddress+'"');
        }
      }
    })()
  }
})()
