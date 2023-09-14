const express = require('express');
const router = new express.Router();
const videoController = require('../controller/videoController');
const vodController = require('../controller/vodController');
const {verifyToken} = require('../util/jwt'); // 用户身份验证
const validator = require('../middleware/validator/videoValidator'); // 用户输入验证

// 获取阿里云VOD上传凭证
router.get('/getUploadVod', vodController.getUploadVod);
// 上传视频凭证
router.post('/upload', verifyToken(), validator.create, videoController.upload);
// 获取视频列表
router.post('/list', videoController.list);
// 获取视频详情
router.get('/detail/:id', verifyToken(false), videoController.detail);
// 发布视频评论
router.post('/comment/:id', verifyToken(), videoController.comment);
// 删除视频评论
router.delete(
  '/comment/:videoId/:commentId',
  verifyToken(),
  videoController.delete
);
// 获取视频评论列表
router.get('/commentList/:id', videoController.commentList);
// 喜爱视频
router.get('/like/:id', verifyToken(), videoController.like);
// 讨厌视频
router.get('/dislikes/:id', verifyToken(), videoController.dislikes);
// 获取喜爱视频列表
router.get('/likeList', verifyToken(), videoController.likeList);
// 获取用户已上传视频列表
router.get('/uploadList', verifyToken(), videoController.uploadList);
// 删除已上传视频
router.delete('/delete/:id', verifyToken(), videoController.delete);
// 修改上传视频信息
router.patch(
  '/update/:id',
  verifyToken(),
  validator.update,
  videoController.update
);

module.exports = router;
