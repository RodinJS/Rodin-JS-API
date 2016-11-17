import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';

chai.config.includeStack = true;

describe('## User APIs', () => {
    let info = {
        token: "",
        user: {
            email: 'gago@test.me',
            username: 'gagas',
            password: '1234567890AAa',
            role: 'Free'
        },
        preSignUpData:{
            userId:76561198135309542,
            source:'steam'
        },
        preSignUpUser:{
            email:'presignupuser@test.me',
            username:'x40steamid',
            password:'1234567890AAa'
        }
    };

    describe('# POST /api/user', () => {
        it('should create a new user', (done) => {
            request(app)
                .post('/api/user')
                .send(info.user)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.data.user.email).to.equal(info.user.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    done();
                });
        });
    });

    describe('# PRE SIGN UP AND SIGN UP FLOW', () => {

        it('should create pre sign up user code', (done) => {
            request(app)
                .post('/api/auth/preSignUp')
                .send(info.preSignUpData)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.signUpCode).to.be.a('string');
                    info.preSignUpUser.signUpCode = res.body.signUpCode;
                    done();
                });
        });

        it('should create a new user with signUpCode', (done) => {
            request(app)
                .post('/api/user')
                .send(info.preSignUpUser)
                //.expect(httpStatus.OK)
                .then(res => {
                    console.log(res.body);
                    expect(res.body.data.user.email).to.equal(info.preSignUpUser.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    info.token = res.body.data.token;
                    done();
                });
        });

        it('should delete a signed up code user', (done) => {
            request(app)
                .delete('/api/user/'+info.preSignUpUser.username)
                .set({ 'x-access-token':info.token})
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
