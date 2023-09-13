const mongoose = require('mongoose');
const config = require('./index');

// 连接数据库
mongoose
  .connect(config.URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .catch((error) => console.log(`连接数据库失败：${error}`));
// 创建连接数据库实例对象
const db = mongoose.connection;
db.on('error', (error) => console.log(`数据库错误：${error}`));
db.on('open', () => console.log(`数据库连接成功`));
