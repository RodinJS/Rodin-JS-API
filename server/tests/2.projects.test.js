import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';
import _  from 'lodash';

chai.config.includeStack = true;
describe('## Projects APIs', () => {


    let project = {
        blank:{
            name: 'testProject',
            tags: ['test'],
            description:'test project description'
        },
        template:{
            name: 'testProjectTemplate',
            tags: ['test', 'template'],
            description:'test project with template'
        }
    };

    before(function (done) {
        User.login(()=> {
            done();
        });
    });


    it('should create a new blank project', (done) => {
        request(app)
            .post('/api/project')
            .set(User.generateHeaders())
            .send(project.blank)
            .expect(httpStatus.CREATED)
            .then(res => {
                project.info = res.body.data;
                expect(res.body.success).to.equal(true);
                done();
            });

    });

    it('should insert teamplates inside DB', (done) => {
        request(app)
            .get('/api/project/templates/importOnce')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                //project.info = res.body.data;
                expect(res.body.success).to.equal(true);
                done();
            });

    });

    it('should get teamplates list', (done) => {
        request(app)
            .get('/api/project/templates/list')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                //project.info = res.body.data;
                expect(res.body.success).to.equal(true);
                expect(res.body.data).to.be.an('array');
                project.templates = res.body.data;
                done();
            });

    });

    it('should create a new project with template', (done) => {
        project.template.templateId = project.templates[0]._id;
        request(app)
            .post('/api/project')
            .set(User.generateHeaders())
            .send(project.template)
            .expect(httpStatus.CREATED)
            .then(res => {
                project.templateInfo = res.body.data;
                expect(res.body.success).to.equal(true);
                done();
            });
    });

    it('should get project with template data', (done)=>{
        request(app)
            .get('/api/project/'+project.templateInfo._id+'')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                expect(res.body.success).to.equal(true);
                expect(res.body.data._id).to.equal(project.templateInfo._id);
                done();
            });
    });

    it('should get tre project with template', (done)=>{
        request(app)
            .get('/api/editor/'+project.templateInfo._id+'')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                expect(res.body.success).to.equal(true);
                expect(res.body.data).to.be.an('object');
                expect(res.body.data.tree.children).to.exist;

                let files = _.map(res.body.data.tree.children, function(file){
                    return file.name;
                });
                expect(files[0]).to.equal('index.html');
                expect(files[1]).to.equal('index.js');
                done();
            });
    });

    it('should remove project with template data', (done)=>{
        request(app)
            .delete('/api/project/'+project.templateInfo._id+'')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                expect(res.body.success).to.equal(true);
                done();
            });
    });

    it('should publish project', (done) => {
        request(app)
            .get('/api/project/publish/'+project.info._id+'')
            .set(User.generateHeaders())
            .expect(httpStatus.OK)
            .then(res => {
                expect(res.body.success).to.equal(true);
                expect(res.body.data).to.equal('Project published');
                done();
            });
    });

});