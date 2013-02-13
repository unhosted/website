var node_static = require('node-static'),
  static_directory = new node_static.Server('.');

require('http').createServer(function(req, res) {
  req.addListener('end', function () {
    static_directory.serve(req, res);
  });
}).listen(42000, function () {
  console.log('See http://localhost:42000/');
});
