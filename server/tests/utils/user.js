/**
 * Created by xgharibyan on 10/21/16.
 */

import request from 'supertest-as-promised';
import app from '../../../index';

const common = {};


function login(done) {

    let user = {
        username: 'gagas',
        password: '1234567890'
    };

    request(app)
        .post('/api/auth/login')
        .send(user)
        .then(res => {
            common.token = res.body.data.token;
            done();
        });

}

function getTestProjects(done){
    request(app)
        .get('/api/project')
        .set(generateHeaders())
        .then(res=>{
            common.project = res.body.data[0];
            done()
        });
}

function generateHeaders(){
    return {
        'x-access-token':getToken()
    }
}

function getToken(){
    return common.token;
}

function getProject(){
    return common.project;
}


export default {login, getToken, getTestProjects, getProject, generateHeaders}
