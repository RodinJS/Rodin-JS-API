import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import {expect} from 'chai';
import app from '../../index';

chai.config.includeStack = true;

describe('## User APIs', () => {
  let info = {
    token: "",
    user: {
      email: 'gago@test.me',
      username: 'gagas',
      password: '1234567890AAa',
      invitationCode:'2B5H7B',
      role: 'Free'
    },
    admin: {
      email: 'mega@admin.me',
      username: 'admin',
      password: '1234567890AAa',
      role: 'Admin'
    },
    signUpUserfacebook: {
      id: 1580547325,
      email: 'presignupuser@fb.me',
      first_name: 'first',
      last_name: 'last',
      password: '1234567890AAa'
    },
    signUpUserGoogle: {
      id: 60601010213,
      email: 'presignupuser@google.me',
      first_name: 'first',
      last_name: 'last',
      password: '1234567890AAa'
    },
    signUpUserSteam: {
      id: 76561198135309542,
      email: 'presignupuser@test.me',
      username: 'x40steamid',
      password: '1234567890AAa'
    },
    signUpUserOculus: {
      id: 494910104949,
      email: 'presignupuseroculus@test.me',
      username: 'x40oculusId',
      password: '1234567890AAa'
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
          expect(res.body.data.user.role).to.equal('Premium');
          info.user.token = res.body.data.token;
          done();
        });
    });

    it('should get public user info', (done) => {
      request(app)
        .get('/api/user/' + info.user.username + '')
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          expect(res.body.data.username).to.equal(info.user.username);
          done();
        });
    });

    it('should update user info', (done) => {
      request(app)
        .put(`/api/user/${info.user.username}`)
        .set({'x-access-token': info.user.token})
        .send({profile:{firstName:'gago', lastName:'mago'}})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });

    it('should update user password', (done) => {
      request(app)
        .put(`/api/user/password`)
        .set({'x-access-token': info.user.token})
        .send({password:'1234567890AAa'})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });

    it('should get me', (done) => {
      request(app)
        .get('/api/user/me')
        .set({'x-access-token': info.user.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          expect(res.body.data.username).to.equal(info.user.username);
          done();
        });
    });

    it('should fail update user password', (done) => {
      request(app)
        .put(`/api/user/password`)
        .set({'x-access-token': info.user.token})
        .send({password:'password'})
        .expect(httpStatus.BAD_REQUEST)
        .then(res => {
          expect(res.body.success).to.equal(false);
          done();
        });
    });

    it('should throw error user exist', (done) => {
      request(app)
        .post('/api/user')
        .send(info.user)
        .expect(httpStatus.EMAIL_EXISTS)
        .then(res => {
          expect(res.body.success).to.equal(false);
          done();
        });
    });

    it('should report error with message - Not found, when user does not exists', (done) => {
      request(app)
        .get('/api/user/56c787ccc67fc16ccc1a5e92')
        .expect(httpStatus.NOT_FOUND)
        .then(res => {
          expect(res.body.error.message).to.equal('Not found');
          done();
        });
    });

  });

  describe('#SOCIAL (oculus, steam, facebook, google) SIGN UP / LOG IN', () => {

    //FACEBOOK
    it('should create a new facebook user', (done) => {
      request(app)
        .post('/api/auth/social/facebook')
        .send(info.signUpUserfacebook)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserfacebook.email);
          expect(res.body.data.user.role).to.equal('Free');
          expect(res.body.data.user.usernameConfirmed).to.equal(false);
          //info.signUpUserfacebook.token = res.body.data.token;
          done();
        });
    });

    it('should login facebook user', (done) => {
      request(app)
        .post('/api/auth/social/facebook')
        .send({id: info.signUpUserfacebook.id})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserfacebook.email);
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserfacebook.token = res.body.data.token;
          done();
        });
    });

    it('should set new facebook user username', (done) => {
      request(app)
        .post('/api/user/confirmUsername')
        .set({'x-access-token': info.signUpUserfacebook.token})
        .send({username: 'facebookuserusername'})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.username).to.equal('facebookuserusername');
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserfacebook.username = res.body.data.user.username;
          info.signUpUserfacebook.token = res.body.data.token;
          done();
        });
    });

    it('should delete facebook user', (done) => {
      request(app)
        .delete('/api/user/' + info.signUpUserfacebook.username)
        .set({'x-access-token': info.signUpUserfacebook.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });

    //GOOGLE
    it('should create a new google user', (done) => {
      request(app)
        .post('/api/auth/social/facebook')
        .send(info.signUpUserGoogle)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserGoogle.email);
          expect(res.body.data.user.role).to.equal('Free');
          expect(res.body.data.user.usernameConfirmed).to.equal(false);
          //info.signUpUserfacebook.token = res.body.data.token;
          done();
        });
    });

    it('should login google user', (done) => {
      request(app)
        .post('/api/auth/social/facebook')
        .send({id: info.signUpUserGoogle.id})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserGoogle.email);
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserGoogle.token = res.body.data.token;
          done();
        });
    });

    it('should set new googe user username', (done) => {
      request(app)
        .post('/api/user/confirmUsername')
        .set({'x-access-token': info.signUpUserGoogle.token})
        .send({username: 'googleuserusername'})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.username).to.equal('googleuserusername');
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserGoogle.username = res.body.data.user.username;
          info.signUpUserGoogle.token = res.body.data.token;
          done();
        });
    });

    it('should delete google user', (done) => {
      request(app)
        .delete('/api/user/' + info.signUpUserGoogle.username)
        .set({'x-access-token': info.signUpUserGoogle.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });

    //STEAM
    it('should create a new steam user', (done) => {
      request(app)
        .post('/api/auth/social/steam')
        .send(info.signUpUserSteam)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserSteam.email);
          expect(res.body.data.user.role).to.equal('Free');
          expect(res.body.data.user.usernameConfirmed).to.equal(true);
          //info.preSignUpUserSteam.token = res.body.data.token;
          done();
        });
    });

    it('should login steam user', (done) => {
      request(app)
        .post('/api/auth/social/steam')
        .send({id: info.signUpUserSteam.id})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserSteam.email);
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserSteam.token = res.body.data.token;
          done();
        });
    });

    it('should delete steam user', (done) => {
      request(app)
        .delete('/api/user/' + info.signUpUserSteam.username)
        .set({'x-access-token': info.signUpUserSteam.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });


    //OCULUS
    it('should create new oculus user', (done) => {
      request(app)
        .post('/api/auth/social/oculus')
        .send(info.signUpUserOculus)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.usernameConfirmed).to.equal(true);
          done();
        });
    });

    it('should login oculus user', (done) => {
      request(app)
        .post('/api/auth/social/oculus')
        .send({id: info.signUpUserOculus.id})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.signUpUserOculus.email);
          expect(res.body.data.user.role).to.equal('Free');
          info.signUpUserOculus.token = res.body.data.token;
          done();
        });
    });

    it('should delete oculus user', (done) => {
      request(app)
        .delete('/api/user/' + info.signUpUserOculus.username)
        .set({'x-access-token': info.signUpUserOculus.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          done();
        });
    });


  });

  describe('#FORGET PASSWORD', () => {

    it('should send reset password email and token', (done) => {
      request(app)
        .post('/api/user/resetPassword')
        .send({resetData: info.user.email, test: 'giveMeAToken'})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          info.resetPasswordToken = res.body.data;
          done();
        });
    });

    it('should should allow successfuly change password', (done) => {
      //console.log(info.resetPasswordToken);
      request(app)
        .put('/api/user/resetPassword')
        .send({password: '1234567890AAa', confirmPassword: '1234567890AAa', token: info.resetPasswordToken})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.success).to.equal(true);
          expect(res.body.data.user.email).to.equal(info.user.email);
          done();
        });
    });

  });

/*  describe('#ADMIN ROLE', () => {
    it('should create a new user with admin role', (done) => {
      request(app)
        .post('/api/user')
        .send(info.admin)
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.admin.email);
          expect(res.body.data.user.role).to.equal('Admin');
          done();
        });
    });

    it('should login admin', (done) => {
      request(app)
        .post('/api/auth/login')
        .send({email: info.admin.email, password: info.admin.password})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body.data.user.email).to.equal(info.admin.email);
          expect(res.body.data.user.role).to.equal('Admin');
          info.admin.token = res.body.data.token;
          done();
        });
    });

    it('should get all users', (done) => {
      request(app)
        .get('/api/user')
        .set({'x-access-token': info.admin.token})
        .expect(httpStatus.OK)
        .then(res => {
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });*/


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
});
