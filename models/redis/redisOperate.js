const {redis} = require('./index');

// 视频热度增长
exports.hotIncrease = async (video, increase) => {
  let data = await redis.zscore('videoHots', video);
  let result;
  if (data) {
    result = await redis.zincrby('videoHots', increase, video);
  } else {
    result = await redis.zadd('videoHots', increase, video);
  }
  return result;
};

// 视频热度排行
exports.hotRank = async (number) => {
  let hots = await redis.zrevrange('videoHots', 0, -1, 'withscores');
  let list = hots.slice(0, number * 2);
  let videoList = [];
  let rank = {};
  for (let i = 0; i < list.length; i++) {
    if (i % 2 == 0) {
      videoList.push(list[i]);
      rank[list[i]] = list[i + 1];
    }
  }
  return {rank, videoList};
};
