/**
 * Created by xgharibyan on 11/3/16.
 */

import express from 'express';
import pagesCtrl from '../controllers/pages';

const router = express.Router();

router.route('/')
  .get(pagesCtrl.list);

router.route('/:url')
  .get(pagesCtrl.getByUrl);


//FAQ
router.route('/support/faq')
  .get(pagesCtrl.getFaq);

//KNOWLEDGEBASE
router.route('/support/knowledgebase/categories')
  .get(pagesCtrl.getKnwolegeCategories);

router.route('/support/knowledgebase/articles/:categoryId')
  .get(pagesCtrl.getKnwolegeCategoryArticles);

router.route('/support/knowledgebase/article/:articleId')
  .get(pagesCtrl.getKnwolegeArticle);

export default router;
