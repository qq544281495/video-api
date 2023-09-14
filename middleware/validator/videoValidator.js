const {body} = require('express-validator');
const validate = require('./error');

module.exports = {
  create: validate([
    body('title')
      .notEmpty()
      .withMessage('视频名称不能为空')
      .bail()
      .isLength({max: 20})
      .withMessage('视频名称长度不能大于20')
      .bail(),
    body('vodId').notEmpty().withMessage('视频凭证不能为空'),
  ]),
  update: validate([
    body('title')
      .notEmpty()
      .withMessage('视频名称不能为空')
      .bail()
      .isLength({max: 20})
      .withMessage('视频名称长度不能大于20'),
    body('vodId').notEmpty().withMessage('视频凭证不能为空'),
  ]),
};
