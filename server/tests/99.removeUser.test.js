import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import _ from 'lodash';
import User from './utils/user';

chai.config.includeStack = true;

describe('## User  APIs', () => {
    let info = {
        user: {
            email: 'gago@test.me',
            username: 'gagas',
            password: '1234567890AAa',
            role: 'Free'
        }
    };

    before(function (done) {
        User.login(()=> {
            User.getTestProjects(()=> {
                done()
            })
        });
    });

    describe('# DELETE /api/user/', () => {

        it('should remove user', (done) => {

            request(app)
                .del('/api/user/'+info.user.username)
                .set(User.generateHeaders())
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    done();
                });
        });

    });
});
