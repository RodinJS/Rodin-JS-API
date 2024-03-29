/**
 * Created by xgharibyan on 10/21/16.
 */

import request from 'supertest-as-promised';
import app from '../../../index';
import UserModel from '../../models/user';
import _ from 'lodash';
import async from 'async';
import mongoose from 'mongoose';

const common = {};

const god = {
    email: 'odin@asgard.io',
    username: 'odin',
    password: 'Lokiis603',
    role: 'God',
};

function login(done) {

    let user = {
        username: 'gagas',
        password: '1234567890AAa',
    };

    request
    (app)
      .post('/api/auth/login')
      .send(user)
      .then(res => {
        common.token = res.body.data.token;
        common.username = user.username;
        common.passowrd = user.password;
        done();
    });

}

function loginAsGod(done) {
    request
    (app)
      .post('/api/auth/login')
      .send(_.pick(god, 'username', 'password'))
      .then(res => {
        common.token = res.body.data.token;
        common.username = god.username;
        common.passowrd = god.password;
        done();
    });
}

function getTestProjects(done) {
    request(app)
      .get('/api/project')
      .set(generateHeaders())
      .then(res => {
        common.project = res.body.data[0];
        done();
    });
}

function generateHeaders() {
    return {
        'x-access-token': getToken(),
    };
}

function generateHookHeader() {
    return {
        'x-access-token': 'K7rd6FzEZwzcc6dQr3cv9kz4tTTZzAc9hdXYJpukvEnxmbdB42V4b6HePs5ZDTYLW_4000dram',
    };
}

function setProject(project) {
    common.project = project;
}

function getProject() {
    return common.project;
}

function getToken() {
    return common.token;
}

function getProject() {
    return common.project;
}

function getUserName() {
    return common.username;
}

function createGod() {
    const GOD = new UserModel(god);
    GOD.save()
      .then(response=> {
    })
      .catch(err=> {
    });
}

function dropCollections(callback) {

    let collections = _.keys(mongoose.connection.collections);
    async.forEach(collections, function (collectionName, done) {
        let collection = mongoose.connection.collections[collectionName];
        collection.drop((err) => {
            if (err && err.message != 'ns not found') done(err);
            done(null);
        });
    }, callback);
}

export default { login, getToken, getTestProjects, getProject, generateHeaders, generateHookHeader, getUserName, createGod, loginAsGod,  dropCollections, setProject };
