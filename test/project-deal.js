var request = require('request');
var expect = require('chai').expect;

describe('deal projects', function() {
  var Body = [];

  it('should successfuly list projects', function(done) {
    request.get('http://localhost:3000/admin?limit=999', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      Body = JSON.parse(body);
      done();
    });
  });

  it('should successfuly show project detail', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(project, index) {
      request.get('http://localhost:3000/admin/' + project.name, {
        json: true
      }, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        if (index === Body.length - 1) done();
      });
    });
  });

  it('should successfuly edit projects', function(done) {
    if (!Body.length) return done();
    Body.forEach(function(project, index) {
      request.patch('http://localhost:3000/admin/' + project.name, {
        json: true,
        body: {
          domain: ['http://baidu.com', 'http://google.com']
        }
      }, function(err, res) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(204);
        if (index === Body.length - 1) done();
      });
    });
  });

  it('should successfuly remove projects', function(done) {
    if (!Body.length) done();
    Body.forEach(function(project, index) {
      request.del('http://localhost:3000/admin/' + project.name, {
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
