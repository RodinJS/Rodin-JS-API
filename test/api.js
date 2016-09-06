var request = require('supertest');
var api = require('../server.js');

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request(api)
      .get('/')
      .expect(200, done);
  });
});

describe('GET /wrong-url', function() {
  it('should return 404', function(done) {
    request(api)
      .get('/reset')
      .expect(404, done);
  });
});

