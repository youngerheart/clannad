var request = require('request');
var expect = require('chai').expect;

describe('deal sources', function() {
  var Body = [];
  var fields = {};
  for (var i = 0; i < 100; i++) {
    fields[`field${i}`] = 'duang';
  }

  it('should successfuly list sources', function(done) {
    request.get('http://localhost:3000/project0/table0?limit=999', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      Body = JSON.parse(body);
      done();
    });
  });

  it('should successfuly show source detail', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(table, index) {
      request.get('http://localhost:3000/project0/table0/' + Body[0]._id, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        if (index === Body.length - 1) done();
      });
    });
  });

  it('should successfuly edit sources', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(source, index) {
      request.patch('http://localhost:3000/project0/table0/' + source._id, {
        json: true,
        body: fields
      }, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(204);
        if (index === Body.length - 1) done();
      });
    });
  });

  it('should successfuly remove sources', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(source, index) {
      request.del('http://localhost:3000/project0/table0/' + source._id, {
        json: true,
        body: {}
      }, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(204);
        if (index === Body.length - 1) done();
      });
    });
  });
});
