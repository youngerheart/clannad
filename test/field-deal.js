var request = require('request');
var expect = require('chai').expect;

describe('deal fields', function() {
  var table;
  var Body = [];

  it('should recive table id', function(done) {
    request.get('http://localhost:3000/admin/project0/table?asc=1', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      table = JSON.parse(body)[0];
      done();
    });
  });

  it('should successfuly list fields', function(done) {
    if (!table) return done();
    request.get('http://localhost:3000/admin/project0/table/' + table._id + '/field?limit=999', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      Body = JSON.parse(body);
      done();
    });
  });

  it('should successfuly edit fields', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(field, index) {
      request.patch('http://localhost:3000/admin/project0/field/' + field._id, {
        json: true,
        body: {
          type: 'Boolean'
        }
      }, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(204);
        if (index === Body.length - 1) done();
      });
    });
  });

  it('should successfuly remove fields', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(field, index) {
      request.del('http://localhost:3000/admin/project0/field/' + field._id, {
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
