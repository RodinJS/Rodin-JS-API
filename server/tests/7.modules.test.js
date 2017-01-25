/**
 * Created by xgharibyan on 1/24/17.
 */

import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';
import httpStatus from '../helpers/httpStatus';
import request from 'supertest-as-promised';

chai.config.includeStack = true;

describe('## CREATE MODULE APIs ', () => {

    const module = {
        title: 'Socket Service',
        description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text",
        author: 'Rodin team',
        thumbnail: 'Here should be base 64 image',
        url: 'socket-server',
        price: 0.0,
    };

    before(function (done) {
        User.loginAsGod(() => {
            done();
        });
    });

    it('should create module with god mode', (done) => {
        request(app)
          .post('/api/modules')
          .send(module)
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            done();
        });

    });

});

describe('##  MODULE APIs ', () => {

    let modules = [];

    before(function (done) {
        User.login(() => {
            done();
        });
    });

    it('should get modules list', (done) => {
        request(app)
          .get('/api/modules')
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            modules = res.body.data;
            done();
        });

    });

   /* it('should fail assign modules cuz it\'s not subcribed', (done) => {
        const project = User.getProject();
        request(app)
          .post('/api/modules/assign')
          .send({ moduleId: modules[0]._id, projectId: project._id, allowedHosts: ['localhost'] })
          .set(User.generateHeaders())
          .expect(httpStatus.BAD_REQUEST)
          .then(res => {
            done();
        });
    });*/

    it('should subscribe modules to user', (done) => {
        request(app)
          .post('/api/modules/subscribe')
          .send({ moduleId: modules[0]._id })
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            done();
        });

    });

    it('should assign modules to user', (done) => {
        const project = User.getProject();
        request(app)
          .post('/api/modules/assign')
          .send({ moduleId: modules[0]._id, projectId: project._id, allowedHosts: ['localhost'] })
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            done();
        });

    });

});
