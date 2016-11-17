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
        preSignUpDataSteam:{
            userId:76561198135309542,
            source:'steam'
        },
        preSignUpUserSteam:{
            email:'presignupuser@test.me',
            username:'x40steamid',
            password:'1234567890AAa'
        },

        preSignUpDataOculus:{
            userId:494910104949,
            source:'oculus'
        },
        preSignUpUserOculus:{
            email:'presignupuseroculus@test.me',
            username:'x40oculusId',
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

    describe('#SOCIAL (oculus, steam) SIGN UP / LOG IN', () => {

        it('should create pre sign up steam user code', (done) => {
            request(app)
                .post('/api/auth/preSignUp')
                .send(info.preSignUpDataSteam)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.signUpCode).to.be.a('string');
                    info.preSignUpUserSteam.signUpCode = res.body.signUpCode;
                    done();
                });
        });

        it('should create a new steam user with signUpCode', (done) => {
            request(app)
                .post('/api/user')
                .send(info.preSignUpUserSteam)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.data.user.email).to.equal(info.preSignUpUserSteam.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    //info.preSignUpUserSteam.token = res.body.data.token;
                    done();
                });
        });

        it('should login steam user', (done) => {
            request(app)
                .post('/api/auth/social/steam')
                .send({id:info.preSignUpDataSteam.userId})
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.data.user.email).to.equal(info.preSignUpUserSteam.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    info.preSignUpUserSteam.token = res.body.data.token;
                    done();
                });
        });

        it('should delete steam user', (done) => {
            request(app)
                .delete('/api/user/'+info.preSignUpUserSteam.username)
                .set({ 'x-access-token':info.preSignUpUserSteam.token})
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    done();
                });
        });



        it('should create pre sign up oculus user code', (done) => {
            request(app)
                .post('/api/auth/preSignUp')
                .send(info.preSignUpDataOculus)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.signUpCode).to.be.a('string');
                    info.preSignUpUserOculus.signUpCode = res.body.signUpCode;
                    done();
                });
        });

        it('should create a new oculus user with signUpCode', (done) => {
            request(app)
                .post('/api/user')
                .send(info.preSignUpUserOculus)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.data.user.email).to.equal(info.preSignUpUserOculus.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    //info.preSignUpUserSteam.token = res.body.data.token;
                    done();
                });
        });

        it('should login oculus user', (done) => {
            request(app)
                .post('/api/auth/social/oculus')
                .send({id:info.preSignUpDataOculus.userId})
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.data.user.email).to.equal(info.preSignUpUserOculus.email);
                    expect(res.body.data.user.role).to.equal('Free');
                    info.preSignUpUserOculus.token = res.body.data.token;
                    done();
                });
        });

        it('should delete oculus user', (done) => {
            request(app)
                .delete('/api/user/'+info.preSignUpUserOculus.username)
                .set({ 'x-access-token':info.preSignUpUserOculus.token})
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
