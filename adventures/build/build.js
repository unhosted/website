var latestEpisode = 8;

var fs = require('fs'),
  part0 = fs.readFileSync('build/0.html'),
  part1 = fs.readFileSync('build/1.html'),
  part2 = fs.readFileSync('build/2.html'),
  part3 = fs.readFileSync('build/3.html'),
  episodesDict = require('./episodes'),
  episodes = [], abbrev = [];

function getFilename(i) {
  return i+'/'+episodes[i].split(' ').join('-')+'.html';
}
function makeEpisodesDiv(current) {
  var str = '';
  for(var i in episodes) {
    if(i == current) {
      str += '        <p><strong>'+ i +'. '+ abbrev[i] +'</strong></p>\n';
    } else {
      str += '        <p> '+ i +'. <a href="../'+ getFilename(i) +'">'+ abbrev[i] +'</a></p>\n';
    }
  }
  return str;
}

function processTitles() {
  var i = 1;
  for(var j in episodesDict["The Basics"]) {
    episodes[i] = episodesDict["The Basics"][j];
    abbrev[i] = j;
    i++;
    if(i > latestEpisode) {
      return;
    }
  }
}

function writeEpisodes() {
  for(var i=1; i<=latestEpisode; i++) {
    var source = fs.readFileSync(i+'/source.html'),
      title = '    <title>Unhosted '+ i +': '+ episodes[i] +'</title>\n',
      header = '      <h2>'+ i + '. '+ episodes[i] +'</h2>\n\n';
    fs.writeFileSync(getFilename(i), part0 + title + part1 + header + source + part2 + makeEpisodesDiv(i) + part3);
  }
}

//...
processTitles();
writeEpisodes();
