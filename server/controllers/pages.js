import _ from 'lodash';
import Promise from 'bluebird';
import APIError from '../helpers/APIError';
import httpStatus from '../helpers/httpStatus';
import Pages from '../models/pages';
import HelpScoutDocs from 'helpscout-docs';
import Q from 'q';
import helpscout from 'helpscout';
const helscoutKey = 'f73de0163c51a6fab050f8f4d5fb550c4e7b0f0e';
const HelpDesk = Promise.promisifyAll(helpscout(helscoutKey));

const hsdocs = _.reduce(new HelpScoutDocs(helscoutKey), (result, value, key) => {
    result[key] = _.reduce(value, (r, v, k) => {
        r[k] = Promise.promisify(v);
        return r;
    }, {});
    return result;
}, {});
let HelpDeskDocsCollections = [];
initHelpDeskCollections();

function initHelpDeskCollections() {
    hsdocs.collections.getAll()
      .then((response) => {
        return HelpDeskDocsCollections = response.collections.items;
    })
      .catch((err)=> {
        console.log('collectionsError', err);
    });
}

function list(req, res, next) {

    Pages.getPagesList()
      .then((pagesList) => onSuccess(pagesList, res))
      .catch((e) => next(e));
}

function getByUrl(req, res, next) {
    if (_.isUndefined(req.params.url)) {
        const err = new APIError(`Provide URL`, httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const pageURL = req.params.url;
    Pages.get(pageURL)
      .then(page => onSuccess(page, res))
      .catch(err => onError(err, next));
}

function getFaq(req, res, next) {
    const colletionID = _.find(HelpDeskDocsCollections, (collection) => collection.slug === 'faq').id;
    hsdocs.articles.getAllByCollection({ id: colletionID })
        .then((articles) => {
        const articlesQueue = _.map(articles.articles.items, (val, key)=> hsdocs.articles.get({ id: val.id }));
        return Q.all(articlesQueue);
    })
        .then((articlesList)=> {
        const mappedArticles = _.map(articlesList, (article)=> _.pick(article.article, ['id', 'name', 'text', 'createdAt']));
        return onSuccess(mappedArticles, res);
    })
        .catch((err) => onError(err, next));

}

function getKnwolegeCategories(req, res, next) {
    const colletionID = _.find(HelpDeskDocsCollections, (collection) => collection.slug === 'knowlagebase').id;
    const allowFields = ['articleCount', 'name', 'id', 'slug', 'visibility'];
    hsdocs.categories.getAllByCollection({ id: colletionID })
      .then((response)=> {
        const categories = _.map(response.categories.items, (category)=> _.pick(category, allowFields));
        return onSuccess(categories, res);
    })
      .catch((err) => onError(err, next));

}

function getKnwolegeCategoryArticles(req, res, next) {
    if (_.isUndefined(req.params.categoryId)) {
        const err = new APIError(`Provide category id`, httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const allowFields = ['slug', 'status', 'name', 'popularity', 'viewCount', 'createdAt', 'updatedAt', 'id'];

    hsdocs.articles.getAllByCategory({ id: req.params.categoryId })
      .then((response)=> {
        const articles = _.map(response.articles.items, (article)=> _.pick(article, allowFields));
        return onSuccess(articles, res);
    })
      .catch((err) => onError(err, next));
}

function getKnwolegeArticle(req, res, next) {
    if (_.isUndefined(req.params.articleId)) {
        const err = new APIError(`Provide category id`, httpStatus.BAD_REQUEST, true);
        return next(err);
    }

    const allowedFields = ['id', 'slug', 'status', 'name', 'text', 'popularity', 'viewCount'];

    hsdocs.articles.get({ id: req.params.articleId })
      .then((response)=> onSuccess(_.pick(response.article, allowedFields), res))
      .catch((err) => onError(err, next));
}

function onSuccess(data, res) {
    return res.status(200).json({ success: true, data: data });
}

function onError(e, next) {
    console.log(e);
    const err = new APIError(`Bad request`, httpStatus.BAD_REQUEST, true);
    return next(err);
}

export default {
    list,
    getByUrl,
    getFaq,
    getKnwolegeCategories,
    getKnwolegeCategoryArticles,
    getKnwolegeArticle,
};
