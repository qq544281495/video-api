const mongoose = require('mongoose');
const md5 = require('../util/md5');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    set: (value) => md5(value), // 密码加密
    select: false, // 该字段不被查询返回
  },
  phone: {
    type: String,
    required: true,
  },
  portrait: {
    type: String,
  },
  subscribers: {
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
module.exports = mongoose.model('User', userSchema, 'users');
