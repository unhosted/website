(function() {
  if(!window.remoteStorage) {
    window.remoteStorage = (function(){
      function workClear() {
      }
      function workSetItem(key, value, revision) {
      }
      function workRemoveItem(key, value, revision) {
      }
      function work() {
        var queue = JSON.parse(localStorage.getItem('_remoteStorageActionQueue'));
        if(queue) {
          if(queue[0].action == 'clear') {
            workClear();
          } else if(queue[0].action == 'setItem') {
            workSetItem(queue[0].key, queue[0].value, queue[0].revision);
          } else if(queue[0].action == 'removeItem') {
            workRemoveItem(queue[0].key, queue[0].revision);
          }
        } 
      }
      function pushAction(action) {
        var queue = JSON.parse(localStorage.getItem('_remoteStorageActionQueue'));
        if(queue==null){
          queue=[];
        }
        if(queue.length) {
          action.revision = queue[queue.length-1].revision + 1;
        } else {
          action.revision = 0;
        }
        queue.push(action);
        localStorage.setItem('_remoteStorageActionQueue', JSON.stringify(queue));
        work();
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
          this.userAddress = userAddress;
          work();
        }
      }
    })()
  }
})()
