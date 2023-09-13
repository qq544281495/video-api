const mongoose = require('mongoose');

const channelSchema = mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'User',
  },
  channel: {
    type: mongoose.ObjectId,
    required: true,
    ref: 'User',
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
module.exports = mongoose.model('Channel', channelSchema, 'channels');
