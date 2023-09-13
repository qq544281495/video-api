const {body} = require('express-validator');
const validate = require('./error');
const User = require('../../models/userSchema');

module.exports = {
  register: validate([
    body('username')
      .notEmpty()
      .withMessage('用户不能为空')
      .bail()
      .custom(async (value) => {
        const nameValidate = await User.findOne({username: value});
        if (nameValidate) {
          return Promise.reject(new Error('用户名已存在'));
        }
      })
      .bail(),
    body('email')
      .notEmpty()
      .withMessage('邮箱不能为空')
      .bail()
      .isEmail()
      .withMessage('邮箱格式错误')
      .bail()
      .custom(async (value) => {
        const emailValidate = await User.findOne({email: value});
        if (emailValidate) {
          return Promise.reject(new Error('邮箱已注册'));
        }
      })
      .bail(),
    body('phone')
      .notEmpty()
      .withMessage('手机号不能为空')
      .bail()
      .custom(async (value) => {
        const phoneValidate = await User.findOne({phone: value});
        if (phoneValidate) {
          return Promise.reject(new Error('手机号已注册'));
        }
      })
      .bail(),
    body('password')
      .notEmpty()
      .withMessage('密码不能为空')
      .bail()
      .isLength({min: 6})
      .withMessage('用户名长度不能小于6')
      .bail(),
  ]),
  login: validate([
    body('email')
      .notEmpty()
      .withMessage('邮箱不能为空')
      .bail()
      .isEmail()
      .withMessage('邮箱格式错误')
      .bail(),
    body('password').notEmpty().withMessage('密码不能为空').bail(),
  ]),
  password: validate([
    body('current_password')
      .notEmpty()
      .withMessage('当前密码不能为空')
      .bail()
      .isLength({min: 6})
      .withMessage('密码长度不能小于6')
      .bail(),
    body('password')
      .notEmpty()
      .withMessage('修改密码不能为空')
      .bail()
      .isLength({min: 6})
      .withMessage('密码长度不能小于6')
      .bail(),
    body('confirmation_password')
      .notEmpty()
      .withMessage('确认修改密码不能为空')
      .bail()
      .isLength({min: 6})
      .withMessage('确认修改密码长度不能小于6')
      .bail(),
  ]),
};
