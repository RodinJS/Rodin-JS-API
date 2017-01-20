import request from 'supertest-as-promised';
import httpStatus from '../helpers/httpStatus';
import chai from 'chai';
import { expect } from 'chai';
import app from '../../index';
import User from './utils/user';

chai.config.includeStack = true;

describe('## Notifications APIs', () => {

    let updatableNotification = {};
    let removableNotification = {};

    before(function (done) {
        User.login(() => {
            done();
        });
    });

    it('should get notifications list', (done) => {
        request(app)
          .get('/api/notifications')
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            updatableNotification = res.body.data[0];
            removableNotification = res.body.data[1];
            done();
        });

    });

    it('should update notification', (done) => {
        request(app)
          .put('/api/notifications?id=' + updatableNotification._id)
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            done();
        });

    });

    it('should delete notification', (done) => {
        request(app)
          .delete('/api/notifications')
          .set(User.generateHeaders())
          .send({ id: removableNotification._id })
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            expect(res.body.data).to.equal('Notification deleted');
            done();
        });
    });

    it('should delete all notification', (done) => {
        request(app)
          .delete('/api/notifications?all=true')
          .set(User.generateHeaders())
          .expect(httpStatus.OK)
          .then(res => {
            expect(res.body.success).to.equal(true);
            expect(res.body.data).to.equal('All notifications deleted');
            done();
        });
    });

});
