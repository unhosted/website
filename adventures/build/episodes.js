var episodes = {
  1: 'Personal servers and unhosted web apps',
  2: 'An unhosted editor',
  3: 'Setting up your personal server',
  4: 'WebSockets',
  5: 'Facebook and Twitter from nodejs',
  6: 'Controlling your server over a WebSocket',
  7: 'ActivityStreams to federate with the platforms',
  8: 'Email',
  9: 'Using unhosted web apps with your own remotestorage server',
 10: 'Collecting and organizing your data'
}

var thisEpisode = parseInt(document.title.split(':')[0].substring('Unhosted '.length));

var navUl = '<h4>Episodes:</h4>';
for(var i in episodes) {
  if(i==thisEpisode) {
    navUl += '<p><strong>'+i+'. '+episodes[i]+'</strong></p>';
  } else {
    navUl += '<p><a href="/adventures/'+i+'/'+episodes[i].split(' ').join('-')+'.html">'+i+'.</a> '+episodes[i]+'</p>';
  }
}
document.getElementById('episodes').innerHTML = navUl;