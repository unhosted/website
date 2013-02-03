var latestEpisode = 8;

var fs = require('fs'),
  part0 = fs.readFileSync('build/0.html'),
  part1 = fs.readFileSync('build/1.html'),
  part2 = fs.readFileSync('build/2.html'),
  part3 = fs.readFileSync('build/3.html'),
  episodes = JSON.parse(fs.readFileSync('build/episodes.js'));

function getFilename(i) {
  return i+'/'+episodes[i].split(' ').join('-')+'.html';
}
function makeEpisodesDiv(current) {
  var str = '';
  for(var i in episodes) {
    if(i == current) {
      str += '        <p><strong>'+ i +'. '+ episodes[i] +'</strong></p>\n';
    } else {
      str += '        <p> '+ i +'. <a href="../'+ getFilename(i) +'">'+ episodes[i] +'</a></p>\n';
    }
  }
  return str;
}
for(var i=1; i<=latestEpisode; i++) {
  var source = fs.readFileSync(i+'/source.html'),
    title = '    <title>Unhosted '+ i +': '+ episodes[i] +'</title>\n',
    header = '      <h2>'+ i + '. '+ episodes[i] +'</h2>\n\n';
  fs.writeFileSync(getFilename(i), part0 + title + part1 + header + source + part2 + makeEpisodesDiv(i) + part3);
}
