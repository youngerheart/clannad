var request = require('request');
var expect = require('chai').expect;

describe('add fields', function() {
  var table;
  it('should recive table id', function(done) {
    request.get('http://localhost:3000/admin/project0/table?asc=1', function(err, res, body) {
      expect(err).to.be.null;
      expect(res.statusCode).to.equal(200);
      table = JSON.parse(body)[0];
      done();
    });
  });
  for (var index = 0; index < 100; index++) {
    test('field' + index);
  }
  function test(name) {
    it('should successfuly add ' + name, function(done) {
      request.post('http://localhost:3000/admin/project0/table/' + table._id + '/field', {
        json: true,
        body: {
          name: name,
          type: 'String',
          required: true
        }
      }, function(err, res, body) {
        expect(err).to.be.null;
        expect(res.statusCode).to.equal(200);
        done();
      });
    });
  };
});
