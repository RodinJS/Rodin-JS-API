import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';
import Helpers from './utils/helpers';
import _  from 'lodash';

chai.config.includeStack = true;


let filesMocks = {
   CREATE:{
       path: '.',
       type: 'file',
       name: 'testfile.js'
   },
   EDIT:{
       path: '.',
       filename: 'testfile.js',
       content: '[1,2,3].map(n => n + 1);'
   }
};

const requestMocks = {
    CREATE_FOLDER: {
        action: 'create',
        path: '.',
        type: 'directory',
        name: 'testfolder'
    },
    COPY_FOLDER: {
        action: 'copy',
        path: '.',
        type: 'directory',
        name: 'testfolder',
        copyName: 'testfolder_copy'
    },
    UPLOAD_FILES: {
        path: '.',
        testUpload: true,
        files: [{
            buffer: new Buffer([91, 49, 44, 50, 44, 51, 93, 46, 109, 97, 112, 40, 110, 32, 61, 62, 32, 110, 32, 43, 32, 49, 41, 59, 10]),
            originalname: 'test_buffer_file.js'
        }]
    }
};

requestMocks.CREATE_FILE = _.assignIn({action: 'create'}, filesMocks.CREATE);
requestMocks.COPY_FILE = _.assignIn({action: 'copy', copyName: 'testfile_copy.js'}, filesMocks.CREATE);
requestMocks.EDIT_FILE = _.assignIn({action: 'save'}, filesMocks.EDIT);
requestMocks.RENAME_FILE = _.assignIn({action: 'rename', newName: 'testfile_rename.js'}, filesMocks.EDIT);
requestMocks.REPLACE_UPLOAD_FILES = _.assignIn({action: 'replace'}, requestMocks.UPLOAD_FILES);
requestMocks.RENAME_UPLOAD_FILES = _.assignIn({action: 'rename'}, requestMocks.UPLOAD_FILES);
requestMocks.UPLOAD_FOLDER = _.assignIn({'folderName': 'testuploadfolder'}, requestMocks.UPLOAD_FILES);


const removableFilesAndFolder = ['testfolder', 'testfile_copy.js', 'testfolder_copy', 'testfile_rename.js'];
const removableUploadFilesAndFolder = ['testuploadfolder', 'test_buffer_file.js', 'test_buffer_file_1.js'];

describe('## Editor APIs', () => {


    before(function (done) {
        User.login(()=> {
            User.getTestProjects(()=> {
                done()
            })
        });
    });


    describe('# POST /api/editor/serve', ()=> {

        it('should create a new file inside project', (done) => {

            request(app)
                .post('/api/editor/serve?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.CREATE_FILE)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('The file was created!');
                    done();
                });

        });

        it('should copy a testfile.js -> testfile_copy.js', (done) => {

            request(app)
                .post('/api/editor/serve?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.COPY_FILE)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('The file was copeid!');
                    done();
                });

        });

        it('should create a new directory inside project', (done) => {

            request(app)
                .post('/api/editor/serve?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.CREATE_FOLDER)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('The folder was created!');
                    done();
                });

        });

        it('should copy a testfolder -> testfolder_copy', (done) => {

            request(app)
                .post('/api/editor/serve?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.COPY_FOLDER)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('The folder was copeid!');
                    done();
                });

        });

    });

    describe('# PUT /api/editor/serve', ()=> {

        it('should edit a testfile.js inside project', (done) => {

            request(app)
                .put('/api/editor/serve?id=' + User.getProject()._id + '&' + Helpers.jsonToQueryString(_.pick(requestMocks.EDIT_FILE, ['filename', 'action'])))
                .set(User.generateHeaders())
                .send(requestMocks.EDIT_FILE)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    done();
                });

        });

        it('should rename to testfile_rename.js inside project', (done) => {

            request(app)
                .put('/api/editor/serve?id=' + User.getProject()._id + '&' + Helpers.jsonToQueryString(_.pick(requestMocks.RENAME_FILE, ['filename', 'action', 'newName'])))
                .set(User.generateHeaders())
                .send(requestMocks.RENAME_FILE)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    done();
                });
        });


        it('should delete files inside project', (done) => {
            let removableCount = 0;
            for (var i = 0; i < removableFilesAndFolder.length; i++) {
                request(app)
                    .delete('/api/editor/serve?id=' + User.getProject()._id + '&filename=' + removableFilesAndFolder[i])
                    .set(User.generateHeaders())
                    .expect(httpStatus.OK)
                    .then(res => {
                        //console.log(res.body);
                        if (res.body.success) removableCount += 1;
                        if (removableCount == removableFilesAndFolder.length)
                            done();
                    });
            }

        });

    });

    describe('# POST /api/upload', ()=> {

        it('should upload file to a project', (done)=> {
            request(app)
                .post('/api/editor/upload?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.UPLOAD_FILES)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('Files successfuly uploaded!');
                    done();
                });
        });

        it('should replace file ', (done)=> {
            request(app)
                .post('/api/editor/upload?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.REPLACE_UPLOAD_FILES)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('Files successfuly uploaded!');
                    done();
                });
        });

        it('should rename duplicate file to a project', (done)=> {
            request(app)
                .post('/api/editor/upload?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.RENAME_UPLOAD_FILES)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('Files successfuly uploaded!');
                    done();
                });
        });

        it('should create folder and add file  inside folder', (done)=> {
            request(app)
                .post('/api/editor/upload?id=' + User.getProject()._id + '')
                .set(User.generateHeaders())
                .send(requestMocks.UPLOAD_FOLDER)
                .expect(httpStatus.OK)
                .then(res => {
                    expect(res.body.success).to.equal(true);
                    expect(res.body.data).to.equal('Files successfuly uploaded!');
                    done();
                });
        });

        it('should search file by text', (done)=>{
            request(app)
                .get('/api/editor/search?id=' + User.getProject()._id + '&path=&search=[1,2,3]')
                .set(User.generateHeaders())
                .expect(httpStatus.OK)
                .then(res=>{
                    expect(res.body.success).to.equal(true);
                    expect(Object.keys(res.body.data).length).to.equal(3);
                    done();
                })
        });


        it('should delete uploaded files', (done) => {

            let removableCount = 0;
            for (var i = 0; i < removableUploadFilesAndFolder.length; i++) {
                request(app)
                    .delete('/api/editor/serve?id=' + User.getProject()._id + '&filename=' + removableUploadFilesAndFolder[i])
                    .set(User.generateHeaders())
                    .expect(httpStatus.OK)
                    .then(res => {
                        if (res.body.success) removableCount += 1;
                        if (removableCount == removableUploadFilesAndFolder.length)
                            done();
                    });
            }

        });

    });

});
