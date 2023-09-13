const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.ObjectId,
    require: true,
    ref: 'User',
  },
  vodId: {
    type: String,
    require: true,
  },
  cover: {
    type: String,
    require: true,
  },
  comments: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  createDate: {
    type: Date,
    default: Date.now(),
  },
  updataDate: {
    type: Date,
    default: Date.now(),
  },
});

// 参数：模型名 模型 数据库表名
module.exports = mongoose.model('Video', videoSchema, 'videos');
