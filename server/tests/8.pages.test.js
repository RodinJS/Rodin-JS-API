/**
 * Created by xgharibyan on 4/10/17.
 */
import chai from 'chai';
import {expect} from 'chai';
import app from '../../index';
import httpStatus from '../helpers/httpStatus';
import request from 'supertest-as-promised';


chai.config.includeStack = true;


describe('## PAGES APIs ', () => {
  let categoryId = false;
  let articleId = false;

  it('should get knwoledgebase categories list form HelpScout', (done) => {
    request(app)
      .get('/api/pages/support/knowledgebase/categories')
      .expect(httpStatus.OK)
      .then(res => {
        expect(res.body.success).to.equal(true);
        expect(res.body.data).to.be.an('array');
        categoryId = res.body.data[0].id;
        done();
      });
  })

  it('should get category articles list form HelpScout', (done) => {
    request(app)
      .get(`/api/pages/support/knowledgebase/articles/${categoryId}`)
      .expect(httpStatus.OK)
      .then(res => {
        expect(res.body.success).to.equal(true);
        expect(res.body.data).to.be.an('array');
        articleId = res.body.data[0].id;
        done();
      });
  });

  it('should get single article from Help Scout', (done) => {
    request(app)
      .get(`/api/pages/support/knowledgebase/article/${articleId}`)
      .expect(httpStatus.OK)
      .then(res => {
        expect(res.body.success).to.equal(true);
        expect(res.body.data).to.be.an('object');
        done();
      });
  })

});
