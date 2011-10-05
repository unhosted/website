(function() {
  if(!window.remoteStorage) {//shim switch

      ///////////////////////
     // poor man's jQuery //
    ///////////////////////

    //implementing $(document).ready(embody):
    document.addEventListener('DOMContentLoaded', function() {
      document.removeEventListener('DOMContentLoaded', arguments.callee, false );
      {
        oauth.harvestToken(backend.setToken);
      }
    }, false)

    //implementing $.ajax():
    function ajax(params) {
      var xhr = new XMLHttpRequest()
      if(!params.method) {
        params.method='GET'
      }
      if(!params.data) {
        params.data = null
      }
      xhr.open(params.method, params.url, true)
      if(params.headers) {
        for(var header in params.headers) {
          xhr.setRequestHeader(header, params.headers[header])
        }
      }
      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if(xhr.status == 0) {
            //alert('looks like '+params.url+' has no CORS headers on it! try copying this scraper and that file both onto your localhost')
            params.error(xhr.responseText);
          } else {
            params.success(xhr.responseText);
          }
        }
      }
      xhr.send(params.data)
    }

    //implementing $():
    function $(str) {
      return document.getElementById(str);
    }


      ///////////////
     // Webfinger //
    ///////////////

    var webfinger = (function(){
      var userAddress, userName, host, templateParts;//this is all a bit messy, but there are a lot of callbacks here, so globals help us with that.
      function getDavBaseUrl(ua, error, cb){
        userAddress = ua;
        var parts = ua.split('@');
        if(parts.length < 2) {
          error('That is not a user address. There is no @-sign in it');
        } else if(parts.length > 2) {
          error('That is not a user address. There is more than one @-sign in it');
        } else {
          if(!(/^[\.0-9A-Za-z]+$/.test(parts[0]))) {
            error('That is not a user address. There are non-dotalphanumeric symbols before the @-sign: "'+parts[0]+'"');
          } else if(!(/^[\.0-9A-Za-z\-]+$/.test(parts[1]))) {
            error('That is not a user address. There are non-dotalphanumeric symbols after the @-sign: "'+parts[1]+'"');
          } else {
            userName = parts[0];
            host = parts[1];
            //error('So far so good. Looking up https host-meta for '+host);
            ajax({
              url: 'https://'+host+'/.well-known/host-meta',
              success: function(data) {
                afterHttpsHostmetaSuccess(data, error, cb);
              },
              error: function(data) {
                afterHttpsHostmetaError(data, error, cb);
              },
            })
          }
        }
      }
      function afterHttpsHostmetaSuccess(data, error, cb) {
        //error('Https Host-meta found.');
        continueWithHostmeta(data, error, cb);
      }

      function afterHttpsHostmetaError(data, error, cb) {
            //error('Https Host-meta error. Trying http.');
            ajax({
              url: 'http://'+host+'/.well-known/host-meta',
              success: function(data) {
                afterHttpHostmetaSuccess(data, error, cb);
              },
              error: function(data) {
                afterHttpHostmetaError(data, error, cb);
              },
            })
      }

      function afterHttpHostmetaSuccess(data, error, cb) {
        //error('Http Host-meta found.');
        continueWithHostmeta(data, error, cb);
      }

      function afterHttpHostmetaError(data, error, cb) {
        error('Cross-origin host-meta failed. Trying through proxy');
        //$.ajax(
        //  { url: 'http://useraddress.net/single-origin-webfinger...really?'+ua
        //   , success: afterWebfingerSuccess
        //   , error: afterProxyError
        //  })
      }

      function continueWithHostmeta(data, error, cb) {
        data = (new DOMParser()).parseFromString(data, 'text/xml');
        if(!data.getElementsByTagName) {
          error('Host-meta is not an XML document, or doesnt have xml mimetype.');
          return;
        }
        var linkTags = data.getElementsByTagName('Link');
        if(linkTags.length == 0) {
          error('no Link tags found in host-meta');
        } else {
          var lrddFound = false;
          var errorStr = 'none of the Link tags have a lrdd rel-attribute';
          for(var linkTagI in linkTags) {
            for(var attrI in linkTags[linkTagI].attributes) {
              var attr = linkTags[linkTagI].attributes[attrI];
              if((attr.name=='rel') && (attr.value=='lrdd')) {
                lrddFound = true;
                errorStr = 'the first Link tag with a lrdd rel-attribute has no template-attribute';
                for(var attrJ in linkTags[linkTagI].attributes) {
                  var attr2 = linkTags[linkTagI].attributes[attrJ];
                  if(attr2.name=='template') {
                    templateParts = attr2.value.split('{uri}');
                    if(templateParts.length == 2) {
                      ajax({
                        url: templateParts[0]+userAddress+templateParts[1],
                        success: function(data) {afterLrddSuccess(data, error, cb);},
                        error: function(data){afterLrddNoAcctError(data, error, cb);},
                      })
                    } else {
                      errorStr = 'the template doesn\'t contain "{uri}"';
                    }
                    break;
                  }
                }
                break;
              }
            }
            if(lrddFound) {
              break;
            }
          }
          if(!lrddFound) {
            error(errorStr);//todo: make this error flow nicer
          }
        }
      }
      function afterLrddNoAcctError() {
        error('the template doesn\'t contain "{uri}"');
        ajax({
          url: templateParts[0]+'acct:'+ua+templateParts[1],
          success: function() {afterLrddSuccess(error, cb);},
          error: function() {afterLrddAcctError(error, cb);}
        })
      }
      function afterLrddSuccess(data, error, cb) {
        data = (new DOMParser()).parseFromString(data, 'text/xml');
        if(!data.getElementsByTagName) {
          error('Lrdd is not an XML document, or doesnt have xml mimetype.');
          return;
        }
        var linkTags = data.getElementsByTagName('Link');
        if(linkTags.length == 0) {
          error('no Link tags found in lrdd');
        } else {
          var davFound = false;
          var errorStr = 'none of the Link tags have a http://unhosted.org/spec/dav/0.1 rel-attribute';
          for(var linkTagI in linkTags) {
            for(var attrI in linkTags[linkTagI].attributes) {
              var attr = linkTags[linkTagI].attributes[attrI];
              if((attr.name=='rel') && (attr.value=='http://unhosted.org/spec/dav/0.1')) {
                davFound = true;
                errorStr = 'the first Link tag with a dav rel-attribute has no href-attribute';
                for(var attrJ in linkTags[linkTagI].attributes) {
                  var attr2 = linkTags[linkTagI].attributes[attrJ];
                  davUrl = attr2.value;
                  if(attr2.name=='href') {
                    //SUCCESS:
                    cb(davUrl);
                    break;
                  }
                }
                break;
              }
            }
            if(davFound) {
              break;
            }
          }
          if(!davFound) {
            error(errorStr);
          }
        }
      }
      return {getDavBaseUrl: getDavBaseUrl};
    })()

      ///////////////////////////
     // OAuth2 implicit grant //
    ///////////////////////////

    var oauth = (function() {
      function go(url) {
        var loc = encodeURIComponent((''+window.location).split('#')[0]);
        window.location = url 
          + 'oauth2/auth?client_id=' + loc
          + '&redirect_uri=' + loc
          + '&scope=' + loc
          + '&response_type=token';
      }
      function harvestToken(cb) {
        var params = location.hash.split('&');
        var paramsToStay = [];
        for(param in params){
          if(params[param].length && params[param][0] =='#') {
            params[param] = params[param].substring(1);
          }
          var kv = params[param].split('=');
          if(kv.length == 2) {
            if(kv[0]=='access_token') {
              cb(kv[1]);
            } else if(kv[0]=='token_type') {
              //ignore silently
            } else {
              paramsToStay.push(params[param]);
            }
          } else {
            paramsToStay.push(params[param]);
          }
        }
        window.location='#'+paramsToStay.join('&');
      }
      return {
        go: go,
        harvestToken: harvestToken,
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
          localStorage.setItem('_remoteStorageUserAddress', userAddress);
          var onError = function(errorMsg) {
            alert(errorMsg);
          }
          var callback = function(davUrl) {
            //alert('connecting to '+davUrl);
            cb();
            oauth.go(davUrl);
          }
          webfinger.getDavBaseUrl(userAddress, onError, callback);
        },
        setToken: function(token) {
          localStorage.setItem('_remoteStorageOauthToken', token);
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
