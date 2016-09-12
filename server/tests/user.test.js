import request from 'supertest-as-promised';
import httpStatus from 'http-status';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

describe('## User APIs', () => {
  let user = {
    email: 'gagoaper',
    password: '1234567890'
  };

  describe('# POST /api/users', () => {
    it('should create a new user', (done) => {
      request(app)
        .post('/api/users')
        .send(user)
        // .expect(httpStatus.OK)
        .then(res => {
          // expect(res.body.email).to.equal(user.email);
          // expect(res.body.role).to.equal('Member');
          // user = res.body;
          done();
        });
    });
  });

  // describe('# GET /api/users/:userId', () => {
  //   it('should get user details', (done) => {
  //     request(app)
  //       .get(`/api/users/${user._id}`)
  //       .expect(httpStatus.OK)
  //       .then(res => {
  //         expect(res.body.email).to.equal(user.email);
  //         expect(res.body.password).to.equal(user.password);
  //         done();
  //       });
  //   });

  //   it('should report error with message - Not found, when user does not exists', (done) => {
  //     request(app)
  //       .get('/api/users/56c787ccc67fc16ccc1a5e92')
  //       .expect(httpStatus.NOT_FOUND)
  //       .then(res => {
  //         expect(res.body.message).to.equal('Not Found');
  //         done();
  //       });
  //   });
  // });

  // describe('# PUT /api/users/:userId', () => {
  //   it('should update user details', (done) => {
  //     user.email = 'gagoaper';
  //     request(app)
  //       .put(`/api/users/${user._id}`)
  //       .send(user)
  //       .expect(httpStatus.OK)
  //       .then(res => {
  //         expect(res.body.email).to.equal('gagoaper');
  //         expect(res.body.password).to.equal(user.password);
  //         done();
  //       });
  //   });
  // });

  // describe('# GET /api/users/', () => {
  //   it('should get all users', (done) => {
  //     request(app)
  //       .get('/api/users')
  //       .expect(httpStatus.OK)
  //       .then(res => {
  //         expect(res.body).to.be.an('array');
  //         done();
  //       });
  //   });
  // });

  // describe('# DELETE /api/users/', () => {
  //   it('should delete user', (done) => {
  //     request(app)
  //       .delete(`/api/users/${user._id}`)
  //       .expect(httpStatus.OK)
  //       .then(res => {
  //         expect(res.body.email).to.equal('gagoaper');
  //         expect(res.body.password).to.equal(user.password);
  //         done();
  //       });
  //   });
  // });
});
