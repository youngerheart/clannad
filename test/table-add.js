var request = require('request');
var expect = require('chai').expect;

describe('add tables', function() {
  for (var index = 0; index < 100; index++) {
    test('table' + index);
  }
  function test(name) {
    it('should successfuly add ' + name, function(done) {
      request.post('http://localhost:3000/admin/project0/table', {
        json: true,
        body: {
          name: name
        }
      }, function(err, res, body) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  };
});
