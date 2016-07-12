var request = require('request');
var expect = require('chai').expect;

describe('hotfix sources', function() {
  var table;
  var Body = [];

  it('should recive table id', function(done) {
    request.get('http://localhost:3000/admin/project0/table?name=table0', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      table = JSON.parse(body)[0];
      done();
    });
  });

  it('should successfuly list fields', function(done) {
    if (!table) return done();
    request.get('http://localhost:3000/admin/project0/table/' + table._id + '/field?limit=999&asc=true', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      Body = JSON.parse(body);
      done();
    });
  });

  it('should successfuly edit fields', function(done) {
    this.timeout(10000);
    if (!Body.length) return done();
    Body.forEach(function(field, index) {
      var body = {
        type: 'Boolean'
      };
      if (index === 2) body.show = {admin: false, user: false, visitor: false};
      request.patch('http://localhost:3000/admin/project0/field/' + field._id, {
        json: true,
        body: body
      }, function(err, res, body) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(204);
        if (index === Body.length - 1) done();
      });
    });
  });
});
