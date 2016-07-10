var request = require('request');
var expect = require('chai').expect;

describe('add source', function() {
  var table;
  var fields = {};
  for (var i = 0; i < 100; i++) {
    fields[`field${i}`] = 'wow';
  }
  it('should recive table id', function(done) {
    request.get('http://localhost:3000/admin/project0/table?name=table0', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      table = JSON.parse(body)[0];
      done();
    });
  });

  it('should change auth for this table', function(done) {
    if (!table) return done();
    request.patch('http://localhost:3000/admin/project0/table/' + table._id, {
      json: true,
      body: {adminAuth: {get: true, post: true, patch: true, delete: true}}
    }, function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(204);
      done();
    });
  });

  for (var index = 0; index < 100; index++) {
    test('source' + index);
  }
  function test(name) {
    it('should successfuly add ' + name, function(done) {
      if (!table) return done();
      request.post('http://localhost:3000/project0/table0', {
        json: true,
        body: fields
      }, function(err, res, body) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  };
});
