(function() {
  if(!window.remoteStorage) {
    window.remoteStorage = {
      getItem: function(k) {
        return localStorage.getItem(k);
      },
      setItem: function(k,v) {
        var ret = localStorage.setItem(k, v);
        window.remoteStorage.length = localStorage.length;
        return ret;
      }
      removeItem: function(k,v) {
        var ret = localStorage.removeItem(k, v);
        window.remoteStorage.length = localStorage.length;
        return ret;
      }
      clear: function() {
        return localStorage.clear();
      }
    }
  }
})()
