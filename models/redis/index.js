const Redis = require('ioredis');
const redis = new Redis();

// 连接redis错误
redis.on('error', (error) => {
  if (error) {
    redis.quit();
    throw new Error(error.message);
  }
});

// 连接redis成功
redis.on('ready', () => {
  console.log('连接redis成功');
});

exports.redis = redis;
