const mongoose = require('mongoose');

const fondSchema = mongoose.Schema({
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
  fondStatus: {
    type: Number,
    enum: [1, 0],
    required: true,
  },
  updataDate: {
    type: Date,
    default: Date.now(),
  },
});

// 参数：模型名 模型 数据库表名
module.exports = mongoose.model('Fond', fondSchema, 'fond');
