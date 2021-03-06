
var async = require('async');
var grunt = require('grunt');
var yaml = require('libyaml');
var hashFile = require('../tasks/lib/common').hashFile;
var s3 = require('../tasks/lib/s3').init(grunt);

module.exports = {
  testUpload : function (test) {
    test.expect(2);

    async.waterfall([
      function (cb) {
        var src = __dirname + '/files/a.txt';
        var dest = __dirname + '/../s3/127/a.txt/.fakes3_metadataFFF/content';

        s3.upload(src, 'a.txt')
          .done(function () {
            test.ok(hashFile(src) === hashFile(dest), 'File uploaded successfully.');
          })
          .always(function () {
            cb(null);
          });
      },
      function (cb) {
        s3.upload('./src does not exist', './dest does not matter')
          .fail(function (err) {
            test.ok(err, 'Missing source results in an error.');
          })
          .always(function () {
            cb(null);
          });
      }
    ], function () {
      test.done();
    });
  },

  testUploadWithHeaders : function (test) {
    test.expect(1);

    async.waterfall([
      function (cb) {
        var src = __dirname + '/files/b.txt';
        var dest = __dirname + '/../s3/127/b.txt/.fakes3_metadataFFF/metadata';

        s3.upload(src, 'b.txt', { headers : {'Content-Type' : '<3'} })
          .always(function () {
            var meta = yaml.parse(grunt.file.read(dest))
            test.ok(meta[0][':content_type'] === new Buffer('<3').toString('base64'), 'Headers are preserved.');
            cb(null);
          });
      }
    ], function () {
      test.done();
    });
  }
};
