import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import _ from 'lodash';

chai.config.includeStack = true;

describe('## Invitation APIs', () => {
    let info = {
        user: {
            email: 'test2@test.me',
            username: 'test2',
            password: '1234567890'
        }
    };

    describe('# POST /api/auth/invitationCode', () => {

        it('should create a invitation Code', (done) => {
            request(app)
                .post('/api/auth/invitationCode')
                .send(_.pick(info.user, 'email'))
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    info.invitationCode = res.body.invitationCode;
                    done();
                });
        });

        it('should delete a invitation Code', (done) => {
            request(app)
                .del('/api/auth/invitationCode')
                .send({invitationCode:info.invitationCode})
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.code).to.equal(info.invitationCode);
                    done();
                });
        });


        it('should create a new premium user with invitation code', (done) => {

            request(app)
                .post('/api/auth/invitationCode')
                .send(_.pick(info.user, 'email'))
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    info.invitationCode = res.body.invitationCode;
                    info.user.invitationCode = info.invitationCode;

                    request(app)
                        .post('/api/user')
                        .send(info.user)
                        .expect(httpStatus.OK)
                        .then(res => {
                            info.token = res.body.data.token;
                            expect(res.body.data.user.email).to.equal(info.user.email);
                            expect(res.body.data.user.role).to.equal('Premium');
                            done();
                        });
                });
        });


        it('should remove premium user', (done) => {

            request(app)
                .del('/api/user/'+info.user.username)
                .set({'x-access-token':info.token})
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    done();
                });
        });


    });

    // describe('# GET /api/user/:userEmail', () => {
    //   it('should get user details', (done) => {
    //     request(app)
    //       .get(`/api/user/${user.email}`)
    //       .expect(httpStatus.OK)
    //       .then(res => {
    //         expect(res.body.email).to.equal(user.email);
    //         expect(res.body.role).to.equal('Free');
    //         done();
    //       });
    //   });

    //   it('should report error with message - Not found, when user does not exists', (done) => {
    //     request(app)
    //       .get('/api/user/56c787ccc67fc16ccc1a5e92')
    //       .expect(httpStatus.NOT_FOUND)
    //       .then(res => {
    //         expect(res.body.message).to.equal('Not Found');
    //         done();
    //       });
    //   });
    // });

    // describe('# PUT /api/user/:userEmail', () => {
    //   it('should update user details', (done) => {
    //     user.email = 'gago@test.de';
    //     request(app)
    //       .put(`/api/user/${user.email}`)
    //       .send(user)
    //       .expect(httpStatus.OK)
    //       .then(res => {
    //         expect(res.body.email).to.equal('gago@test.de');
    //         expect(res.body.role).to.equal('Free');
    //         done();
    //       });
    //   });
    // });

    // describe('# GET /api/user/', () => {
    //   it('should get all users', (done) => {
    //     request(app)
    //       .get('/api/user')
    //       .expect(httpStatus.OK)
    //       .then(res => {
    //         expect(res.body).to.be.an('array');
    //         done();
    //       });
    //   });
    // });

    // describe('# DELETE /api/user/', () => {
    //   it('should delete user', (done) => {
    //     request(app)
    //       .delete(`/api/user/${user.email}`)
    //       .expect(httpStatus.OK)
    //       .then(res => {
    //         expect(res.body.email).to.equal('gago@test.me');
    //         expect(res.body.role).to.equal('Free');
    //         done();
    //       });
    //   });
    // });
});
