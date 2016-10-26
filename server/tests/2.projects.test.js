import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';

chai.config.includeStack = true;
describe('## Projects APIs', () => {


    before(function (done) {
        User.login(()=> {
            done();
        });
    });


    it('should create a new project', (done) => {
        let project = {
            headers:{
             'x-access-token':User.getToken()
            },
            data:{
                name: 'testProject',
                tags: ['test'],
                description:'test project description'
            }
        };
        request(app)
            .post('/api/project')
            .set(project.headers)
            .send(project.data)
            .expect(httpStatus.CREATED)
            .then(res => {
                expect(res.body.success).to.equal(true);
                done();
            });

    });

});
