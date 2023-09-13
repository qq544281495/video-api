const express = require('express');
const router = new express.Router();
const userController = require('../controller/userController');
const validator = require('../middleware/validator/userValidator'); // 用户输入验证
const {verifyToken} = require('../util/jwt'); // 用户身份验证
const multer = require('multer');
const upload = multer({dest: 'public/'});

// 注册
router.post('/register', validator.register, userController.register);
// 登录
router.post('/login', validator.login, userController.login);
// 用户密码修改
router.patch(
  '/password',
  verifyToken(),
  validator.password,
  userController.password
);
// 获取用户列表
router.get('/list', verifyToken(), userController.list);
// 上传用户头像
router.post(
  '/portrait',
  verifyToken(),
  upload.single('portrait'),
  userController.portrait
);
// 订阅频道
router.get('/subscribe/:id', verifyToken(), userController.subscribe);
// 取消订阅频道
router.get('/unsubscribe/:id', verifyToken(), userController.unsubscribe);
// 获取频道详情
router.get(
  '/channelDetail/:id',
  verifyToken(false),
  userController.channelDetail
);
// 获取用户订阅频道列表
router.get('/subscribeList/:id', userController.subscribeList);
// 获取频道订阅用户列表
router.get('/channelList', verifyToken(), userController.channelList);

module.exports = router;
