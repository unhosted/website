var latestEpisode = 1;

var fs = require('fs'),
  part0 = fs.readFileSync('build/0.html'),
  part1 = fs.readFileSync('build/1.html'),
  part2 = fs.readFileSync('build/2.html'),
  part3 = fs.readFileSync('build/3.html'),
  part4 = fs.readFileSync('build/4.html'),
  episodes = fs.readFileSync('build/episodes.js');

function getFilename(i) {
  return i+'/'+episodes[i].split(' ').join('-')+'.html';
}
function makeEpisodesDiv(current) {
  var str = '<ul>\n';
  for(var i in episodes) {
    if(i == current) {
      str += '  <li> '+i+'. <strong>'+episodes[i]+'</strong></li>\n';
    } else {
      str += '  <li> '+i+'. <a href="../'+getFilename(i)'">'+episodes[i]+'</a></li>\n';
    }
  }
  return str+'</ul>\n';
}
for(var i=1; i<=latestEpisode; i++) {
  var source = fs.readFileSync(i+'/source.html'),
    title = '      <title>Unhosted '+ i +': '+ episodes[i] +'</title>\n',
    header = '      <h2>'+ i + '. '+ episodes[i] +'</h2>\n';
  fs.writeFileSync(getFilename(i), part1 + title + part2 + header + source + part3 + makeEpisodeDiv(i) + part4);
}
