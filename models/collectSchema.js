const mongoose = require('mongoose');

const collectSchema = mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'User',
  },
  video: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'Video',
  },
  author: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'User',
  },
  updataDate: {
    type: Date,
    default: Date.now(),
  },
});

// 参数：模型名 模型 数据库表名
module.exports = mongoose.model('Collect', collectSchema, 'collect');
