import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';

chai.config.includeStack = true;
describe('## Projects APIs', () => {


    let project = {
        data:{
            name: 'testProject',
            tags: ['test'],
            description:'test project description'
        }
    };

    before(function (done) {
        User.login(()=> {
            done();
        });
    });


    it('should create a new project', (done) => {
        request(app)
            .post('/api/project')
            .set(User.generateHeaders())
            .send(project.data)
            .expect(httpStatus.CREATED)
            .then(res => {
                project.info = res.body.data;
                expect(res.body.success).to.equal(true);
                done();
            });

    });

    it('should publish   project', (done) => {
        request(app)
            .get('/api/project/publish/'+project.info._id+'')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                console.log(res.body);
                expect(res.body.success).to.equal(true);
                expect(res.body.data).to.equal('Project published');
                done();
            });
    });

});
