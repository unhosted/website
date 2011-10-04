(function() {
  if(!window.remoteStorage) {//shim switch
      ///////////////
     // Webfinger //
    ///////////////

    var webfinger = (function() {
      var webFinger = {}
      var getHostMeta = function( userAddress, linkRel, onError, cb ){
	//split the userAddress at the '@' symbol:
	var parts = userAddress.split('@')
	if( parts.length == 2 ){
	  var user = parts[0]
	  var domain = parts[1]

	  ajax(
	    { url: 'https://'+ domain +'/.well-known/host-meta'
	    , timeout: 1000
	    , dataType: 'xml'
	    , success: function( xml ){
	      try {
		$(xml).find('Link').each(function(){
		  var rel = $(this).attr('rel')
		  if( rel == linkRel ){
		    cb( $(this).attr('template') )
		  }
		})
	      } catch(e) {
		onError()
	      }
	    }
	    , error: function() {//retry with http:
	      $.ajax(
		{ url: 'http://'+ domain +'/.well-known/host-meta'
		, timeout: 1000
		, dataType: 'xml'
		, success: function( xml ){
		  try {
		    $(xml).find('Link').each(function(){
		      var rel = $(this).attr('rel')
		      if( rel == linkRel ){
			cb( $(this).attr('template') )
		      }
		    })
		  } catch(e) {
		    onError()
		  }
		}
		, error: onError
		} )
	      }
	    } )
	} else {
	  onError()
	}
      }
      webFinger.getDavBaseUrl = function(userAddress, cb, onError) {
	//get the WebFinger data for the user and extract the uDAVdomain:
	getHostMeta( userAddress, 'lrdd', onError, function( template ){
	  ajax(
	    { url: template.replace( /{uri}/, userAddress, true )
	    , timeout: 10000
	    , dataType: 'xml'
	    , success: function(xml){
	      try {
		$(xml).find('Link').each(function() {
		  if( $(this).attr('rel') == 'http://unhosted.org/spec/dav/0.1' ) ){
		    cb( $(this).attr('href') )
		    //TODO: should exit loop now that a matching result was found.                
		  }
		})
	      } catch( e ) {
		onError()
	      }
	    }
	    , error: onError
	  })
	})
      }
      return webFinger
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
          var url = webfinger.getDavBaseUrl(userAddress, function() {
            alert('connecting to '+url);
            cb();
          });
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
