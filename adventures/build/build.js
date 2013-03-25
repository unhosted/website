var latestEpisode = 14,
  buildAhead = 1,
  zeroDate = 1355227200000;

var fs = require('fs'),
  part0 = fs.readFileSync('build/0.html'),
  part1 = fs.readFileSync('build/1.html'),
  part2 = fs.readFileSync('build/2.html'),
  part3 = fs.readFileSync('build/3.html'),
  part4 = fs.readFileSync('build/4.html'),
  episodesDict = require('./episodes'),
  overviewPages = {
    i: 'definition',
    ii: 'examples',
    iii: 'people',
    iv: 'events',
    v: 'tools',
    vi: 'forum'
  }, overviewPaths = {
    i: '/',
    ii: '/apps/',
    iii: '/people/',
    iv: '/events/',
    v: '/tools/',
    vi: 'https://groups.google.com/forum/#!forum/unhosted'
  },
  episodes = [], abbrev = [];

function getFilename(i) {
  return i+'/'+episodes[i].split(' ').join('-')+'.html';
}
function makeEpisodesDiv(current) {
  var str = '\n<h4>Overview:</h4>\n', spaces;
  for(var i in overviewPages) {
    spaces='';
    //for(var j=3; j>i.length; j--) {
    //  spaces += '&nbsp;';
    //}
    if(i == current) {
      str += '        <p>'+ spaces +'<strong>'+ i +'. '+ overviewPages[i] +'</strong></p>\n';
    } else {
      str += '        <p> '+ spaces + i +'. <a href="'+ overviewPaths[i] +'">'+ overviewPages[i] +'</a></p>\n';
    }
  }
  str += '\n<h4>Handbook:</h4>\n';
  for(var i in episodes) {
    spaces = '';
    if(i == current) {
      str += '        <p><strong>'+ spaces + i +'. '+ abbrev[i] +'</strong></p>\n';
    } else {
      str += '        <p> '+ spaces + i +'. <a href="/adventures/'+ getFilename(i) +'">'+ abbrev[i] +'</a></p>\n';
    }
  }
  return str + '      </div>\n';
}

function processTitles() {
  episodes = [];
  abbrev = [];
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
      title = '    <title>unhosted web apps '+ i +': '+ abbrev[i] +'</title>\n',
      header = '      <h2>'+ i +'. '+ episodes[i] +'</h2>\n\n',
      next = (i==latestEpisode?'\n      <p>The next episode will appear on Tuesday '+getNextTuesday()+'.</p>':'\n      <p>Next: <a href="../'+getFilename(i+1) + '">'+ episodes[i+1] +'</a></p>');
    fs.writeFileSync(getFilename(i), part0 + title + part1 + header + source + next + part2 + makeEpisodesDiv(i)
        + part3 + part4);
  }
}
function writeOverviewPage(i) {
  var title = '    <title>unhosted web apps: '+ overviewPages[i] +'</title>\n',
    header = '      <h2>'+ overviewPages[i] +'</h2>\n\n',
    source = fs.readFileSync('..'+overviewPaths[i]+'source.html');
  fs.writeFileSync('..'+overviewPaths[i]+'index.html', part0 + title + part1 + header + source + part2 + makeEpisodesDiv(i)
      + part4);
}
function getDate(i) {
  return new Date(zeroDate+i*7*86400*1000).toISOString();
}
function getNextTuesday() {
  var d = new Date(zeroDate+(latestEpisode+1)*7*86400*1000),
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return d.getUTCDate()
    +' '+months[d.getUTCMonth()]
    +', '+d.getUTCFullYear();
}
function writeRss() {
  var str = '<?xml version="1.0" encoding="UTF-8"?>\n'
    +'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:georss="http://www.georss.org/georss">\n'
    +'  <channel>\n'
    +'    <title>Unhosted Adventures</title>\n'
    +'    <link>https://unhosted.org/adventures/</link>\n'
    +'    <atom:link type="application/rss+xml" href="https://unhosted.org/adventures/feed.rss" rel="self"></atom:link>\n'
    +'    <image>\n'
    +'      <link>https://unhosted.org/adventures/img/island-color.jpg</link>\n'
    +'      <title>Unhosted Adventures</title>\n'
    +'      <url>https://unhosted.org/adventures/img/island-color.jpg</url>\n'
    +'    </image>\n'
    +'    <description>Official handbook of the No Cookie Crew</description>\n'
    +'    <language>en-us</language>\n'
    +'    <ttl>40</ttl>\n';
  for(var i=latestEpisode; i>=1; i--) {
    str += '    <item>\n'
      +'      <title>'+i+'. '+episodes[i]+'</title>\n'
      +'      <description>Episode '+i+' of Unhosted Adventures</description>\n'
      +'      <pubDate>'+getDate(i)+'</pubDate>\n'
      +'      <guid>https://unhosted.org/adventures/'+getFilename(i)+'</guid>\n'
      +'      <link>https://unhosted.org/adventures/'+getFilename(i)+'</link>\n'
      +'      <georss:point>10.2 104.0</georss:point>\n'
      +'    </item>\n';
  }
  str += ' </channel>\n</rss>\n';
  fs.writeFileSync('feed.rss', str);
}
function writeAtom() {
  var str = '<?xml version="1.0" encoding="UTF-8"?>\n'
    +'<feed xml:lang="en-US" xmlns="http://www.w3.org/2005/Atom" xmlns:thr="http://purl.org/syndication/thread/1.0" xmlns:georss="http://www.georss.org/georss" xmlns:activity="http://activitystrea.ms/spec/1.0/" xmlns:media="http://purl.org/syndication/atommedia" xmlns:poco="http://portablecontacts.net/spec/1.0" xmlns:ostatus="http://ostatus.org/schema/1.0">\n'
    +'  <id>https://unhosted.org/adventures/feed.atom</id>\n'
    +' <title>Unhosted Adventures</title>\n'
    +' <subtitle>Official Handbook of the No Cookie Crew</subtitle>\n'
    +'  <logo>https://unhosted.org/adventures/img/island-color.jpg</logo>\n'
    +' <updated>'+getDate(latestEpisode)+'</updated>\n'
    +'<author>\n'
    +' <activity:object-type>http://activitystrea.ms/schema/1.0/person</activity:object-type>\n'
    +'  <uri>https://michielbdejong.com/</uri>\n'
    +' <name>Michiel B. de Jong</name>\n'
    +' <link rel="avatar" type="image/jpeg" media:width="96" media:height="96" href="https://unhosted.org/adventures/img/michiel.jpg"/>\n'
    +' <georss:point>10.20 104.0</georss:point>\n'
    +' <poco:preferredUsername>michielbdejong</poco:preferredUsername>\n'
    +' <poco:displayName>Michiel B. de Jong</poco:displayName>\n'
    +' <poco:note>Nomadic hacker</poco:note>\n'
    +' <poco:address>\n'
    +'  <poco:formatted>Hacker Beach</poco:formatted>\n'
    +' </poco:address>\n'
    +' <poco:urls>\n'
    +'  <poco:type>homepage</poco:type>\n'
    +'  <poco:value>https://michielbdejong.com/</poco:value>\n'
    +'  <poco:primary>true</poco:primary>\n'
    +' </poco:urls>\n'
    +'</author>\n'
    +'<link href="https://unhosted.org/adventures/feed.atom" rel="self" type="application/atom+xml"/>\n';
  for(var i=latestEpisode; i>=1; i--) {
    str += '<entry>\n'
      +' <activity:object-type>http://activitystrea.ms/schema/1.0/comment</activity:object-type>\n'
      +' <id>https://unhosted.org/adventures/'+getFilename(i)+'</id>\n'
      +' <title>'+i+'. '+episodes[i]+'</title>\n'
      +' <link rel="alternate" type="text/html" href="https://unhosted.org/adventures/'+getFilename(i)+'"/>\n'
      +' <activity:verb>http://activitystrea.ms/schema/1.0/post</activity:verb>\n'
      +' <published>'+getDate(i)+'</published>\n'
      +' <updated>'+getDate(i)+'</updated>\n'
      +' <georss:point>10.20 104.0</georss:point>\n'
      +'</entry>\n';
  }
  str += '</feed>\n';
  fs.writeFileSync('feed.atom', str);
}

//...
latestEpisode += buildAhead;
console.log('building up to '+latestEpisode);
processTitles();
writeEpisodes();
latestEpisode -= buildAhead;
console.log('now building up to '+latestEpisode);
processTitles();
writeEpisodes();
writeOverviewPage('i'); writeOverviewPage('ii'); writeOverviewPage('iii'); writeOverviewPage('iv'); writeOverviewPage('v');
writeRss();
writeAtom();
