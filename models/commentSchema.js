const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
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
  createDate: {
    type: Date,
    default: Date.now(),
  },
});

// 参数：模型名 模型 数据库表名
module.exports = mongoose.model('Comment', commentSchema, 'comment');
