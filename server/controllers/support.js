import _ from 'lodash';
import Promise from 'bluebird';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Pages from '../models/pages';
import Landing from '../models/landing';
import HelpScoutDocs from 'helpscout-docs';
import Q from 'q';
import helpscout from 'helpscout';
import request from 'request';
const apiKey = '19796176812c0a05720d4c046949abbbc335d950';
const mailboxes = {
  'Q&A': {
    id: 116708,
    name: 'Q&A'
  },
  'issues': {
    id: 116708,
    name: 'issues'
  },
  'features': {
    id: 116708,
    name: 'features'
  }

};
const testData = {
  customer: {
    id: 135005615,
    //email: "aram@rodin.io"
  },
  mailbox: {
    id: 116708,
    name: "Hello"
  },
  subject: "I need help",
  status: "active",
  createdAt: new Date(),
  threads: [{
    type: "customer",
    createdBy: {
      id: 135005615,
      email: "aram@rodin.io",
      type: "customer"
    },
    body: 'I need your help with an issue Im having.',
    status: "active",
    createdAt: new Date()
  }],
};
const defaultParams = {
  headers: {
    'Content-Type': 'application/json'
  },
  json: true,
  auth: {
    'user': apiKey,
    'pass': 'X'
  },
};

function _initThread(req) {
  const customer = {
    id: req.hsUser.id,
    email: req.hsUser.emails[0],
    type: "customer",
  };
  return {
    type: "customer",
    createdBy: customer,
    body: req.body.description,
    status: "active",
    createdAt: new Date()
  }
}

function _initThreadParams(method, req) {
  const data = {
    url: `https://api.helpscout.net/v1/conversations/${req.body.conversationId}.json`,
    method: method,
    body: _initThread(req)
  };
  Object.assign(data, defaultParams);
  return data;
}

function _initConversationParams(method, req, mailbox) {
  const customer = {
    id: req.hsUser.id,
    email: req.hsUser.emails[0],
    type: "customer",
  };
  const data = {
    url: 'https://api.helpscout.net/v1/conversations.json',
    method: method,

    body: {
      customer: customer,
      mailbox: mailbox,
      subject: req.body.subject,
      status: "active",
      createdAt: new Date(),
      tags: req.body.tags,
      threads: [],
    }
  };
  data.body.threads.push(_initThread(req));
  Object.assign(data, defaultParams);
  return data;

}

function _initConversationListParams(mailbox) {
  const options = {
    url: `https://api.helpscout.net/v1/mailboxes/${mailbox}/conversations.json`,
    method: 'GET',
    qs: {
      status: 'active'
    }
  };
  Object.assign(options, defaultParams);
  return options;
}

function _initCustomerSearchParams(req) {
  const data = {
    url: 'https://api.helpscout.net/v1/search/customers.json',
    method: 'GET',
    qs: {
      query: req.user.email
    }
  };
  Object.assign(data, defaultParams);
  return data;
}

function _initSearchParams(req) {
  let mailboxId = 0;
  switch (req.params.type) {
    case 'issues':
      mailboxId = mailboxes['issues'].id;
      break;
    case 'features':
      mailboxId = mailboxes['features'].id;
      break;
    default:
      mailboxId = mailboxes['Q&A'].id;
  }
  const data = {
    url: 'https://api.helpscout.net/v1/search/conversations.json',
    method: 'GET',
    qs: {
      query: `mailboxid:${mailboxId}`
    }
  };
  if(req.query.subject) data.qs.query+=` AND subject:"${req.query.subject}"`;
  if(req.query.tags){
    data.qs.query+= ` AND ${req.query.tags.map((date) => `tag:"${date}" `).join(" OR ")}`
  }
  Object.assign(data, defaultParams);
  console.log('QUERY', data.qs.query);
  return data;
}

function _initCustomerParams(method, req) {
  const data = {
    url: 'https://api.helpscout.net/v1/customers.json',
    method: method,

    body: {
      "firstName": req.user.profile ? req.user.profile.firstName : req.user.username,
      "lastName": req.user.profile ? req.user.profile.lastName : req.user.username,
      "emails": [{
        "value": req.user.email
      }]
    }
  };
  Object.assign(data, defaultParams);
  return data;
}

function _grabTags(data) {
  const allTags = _.chain(data)
    .reduce((acc, val, key) => {
      acc = _.concat(acc, val.tags);
      return acc;
    }, [])
    .groupBy('length')
    .map((items, name) => ({name: items[0], count: items.length}))
    .value();

  return allTags;
}

function _submit(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err || response.statusCode > 300) return reject(err || {code: response.statusCode, err: response.body});
      return resolve(body);
    });
  })
}

function createQuestion(req, res, next) {
  let param = '';
  switch (req.params.type) {
    case 'issues':
      param = mailboxes['issues'];
      break;
    case 'features':
      param = mailboxes['features'];
      break;
    case 'questions':
    default:
      param = mailboxes['Q&A'];
      break;

  }
  const conversationParams = _initConversationParams('POST', req, param);
  _submit(conversationParams)
    .then(response => onSuccess(`Conversation Create`, res))
    .catch(err => onError(err, next))
}

function createQuestionThread(req, res, next) {
  let param = '';
  switch (req.params.type) {
    case 'issues':
      param = mailboxes['issues'];
      break;
    case 'features':
      param = mailboxes['features'];
      break;
    case 'questions':
    default:
      param = mailboxes['Q&A'];
      break;

  }
  const threadParams = _initThreadParams('POST', req);
  _submit(threadParams)
    .then(response => onSuccess(`thread Create`, res))
    .catch(err => onError(err, next))
}

function validateCustomer(req, res, next) {
  const customerQuery = _initCustomerSearchParams(req);
  const returnData = function (response) {
    req.hsUser = response.items[0];
    return next();
  };
  _submit(customerQuery)
    .then(response => {
      console.log('response', response);
      if (response.items && response.items[0]) {
        return returnData(response);
      }
      const customerParams = _initCustomerParams('POST', req);
      return _submit(customerParams)
        .then(response => _submit(customerQuery))
        .then(response => returnData(response))
    })
    .catch(err => {
      console.log('err', err);
      onError(err, next);
    })
}

function getQuestionsList(req, res, next) {
  let param = '';
  switch (req.params.type) {
    case 'issues':
      param = mailboxes['issues'].id;
      break;
    case 'features':
      param = mailboxes['features'].id;
      break;
    case 'questions':
    default:
      param = mailboxes['Q&A'].id;

  }

  const options = _initConversationListParams(param);
  return _submit(options)
    .then(response => onSuccess(response, res))
    .catch(err => onError(err, next))
}

function getConversation(req, res, next) {
  if (_.isUndefined(req.params.id)) return onError(`Provide conversation id`, next);
  const options = {
    url: `https://api.helpscout.net/v1/conversations/${req.params.id}.json`,
    method: 'GET',
  };
  Object.assign(options, defaultParams);
  return _submit(options)
    .then(response => onSuccess(response, res))
    .catch(err => onError(err, next))
}

function getTags(req, res, next) {
  let param = '';
  switch (req.params.type) {
    case 'issues':
      param = mailboxes['issues'].id;
      break;
    case 'features':
      param = mailboxes['features'].id;
      break;
    default:
      param = mailboxes['Q&A'].id;

  }
  const options = _initConversationListParams(param);
  Object.assign(options, defaultParams);
  return _submit(options)
    .then(response => onSuccess(_grabTags(response.items), res))
    .catch(err => onError(err, next))
}

function searchConversations(req, res, next){
  const options  = _initSearchParams(req);
  return _submit(options)
    .then(response => onSuccess(response, res))
    .catch(err => onError(err, next))
}

function onSuccess(data, res) {
  return res.status(200).json({success: true, data: data});
}

function onError(e, next) {
  console.log(e);
  const err = new APIError(`Bad request`, httpStatus.BAD_REQUEST, true);
  return next(err);
}

export default {
  createQuestion,
  validateCustomer,
  createQuestionThread,
  getQuestionsList,
  getConversation,
  getTags,
  searchConversations
};
