const Video = require('../models/videoSchema'); // 视频数据模型
const Comment = require('../models/commentSchema'); // 评论数据模型
const Fond = require('../models/fondSchema'); // 喜爱视频数据模型
const Channel = require('../models/channelSchema'); // 频道数据模型
const Collect = require('../models/collectSchema'); // 收藏数据模型
const {hotIncrease, hotRank} = require('../models/redis/redisOperate'); // 视频热度增长 & 热门视频

// 热门推荐机制 观看+1 喜欢+2 评论+2 收藏+3

module.exports = {
  // 上传视频凭证
  upload: async (request, response) => {
    try {
      let {_id} = request.user;
      let params = request.body;
      params.user = _id;
      const video = new Video(params);
      await video.save();
      response.status(200).json({data: {message: '视频凭证上传成功'}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取视频列表
  list: async (request, response) => {
    try {
      let {pageNumber = 1, pageSize = 10} = request.body;
      let list = await Video.find()
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .sort({createDate: -1})
        .populate('user', '_id username portrait');
      let count = await Video.countDocuments();
      let page = {
        pageNumber,
        pageSize,
        count,
      };
      response.status(200).json({data: {list, page}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取视频详情
  detail: async (request, response) => {
    try {
      let id = request.params.id;
      let data = await Video.findById(id).populate(
        'user',
        '_id username portrait'
      );
      data = data.toJSON();
      const user = request.user;
      if (user) {
        const userId = user._id;
        data.islike = false;
        data.isdislike = false;
        data.subscriber = false;
        let fond = await Fond.findOne({user: userId, video: id});
        let channel = await Channel.findOne({
          user: userId,
          channel: data.user._id,
        });
        if (channel) data.subscriber = true;
        if (fond && fond.fondStatus === 1) data.islike = true;
        if (fond && fond.fondStatus === 0) data.isdislike = true;
      }
      // 观看视频热度+1
      await hotIncrease(id, 1);
      response.status(200).json({data});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 发布视频评论
  comment: async (request, response) => {
    try {
      const videoId = request.params.id;
      const userId = request.user._id;
      const content = request.body.content;
      let video = await Video.findById(videoId);
      if (video) {
        const commentVideo = await new Comment({
          user: userId,
          video: videoId,
          content,
        }).save();
        if (commentVideo) {
          // 发布评论热度+2
          await hotIncrease(videoId, 2);
        }
        video.comments++;
        await video.save();
        response.status(200).json({data: {message: '评论成功'}});
      } else {
        response.status(404).json({error: '评论视频不存在'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 删除视频评论
  delete: async (request, response) => {
    try {
      const {videoId, commentId} = request.params;
      const userId = request.user._id;
      const video = await Video.findById(videoId);
      if (!video) return response.status(404).json({error: '视频不存在'});
      const comment = await Comment.findById(commentId);
      if (!comment) return response.status(404).json({error: '评论不存在'});
      if (!comment.user.equals(userId))
        return response.status(403).json({error: '评论不可删除'});
      await Comment.findByIdAndDelete(commentId);
      video.comments--;
      await video.save();
      response.status(200).json({data: {message: '评论删除成功'}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取视频评论列表
  commentList: async (request, response) => {
    try {
      const videoId = request.params.id;
      let {pageNumber = 1, pageSize = 10} = request.body;
      const list = await Comment.find({video: videoId})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('user', '_id username portrait');
      const count = await Comment.countDocuments({video: videoId});
      const page = {
        pageNumber,
        pageSize,
        count,
      };
      response.status(200).json({data: {list, page}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 喜爱视频
  like: async (request, response) => {
    try {
      const videoId = request.params.id;
      const userId = request.user._id;
      const video = await Video.findById(videoId);
      let islike = true;
      if (!video) return response.status(404).json({error: '视频不存在'});
      const fond = await Fond.findOne({
        user: userId,
        video: videoId,
      });
      if (fond && fond.fondStatus === 1) {
        const fondId = fond._id;
        await Fond.findByIdAndDelete(fondId);
        // 取消喜欢视频热度-2
        await hotIncrease(videoId, -2);
        islike = false;
      } else if (fond && fond.fondStatus === 0) {
        fond.fondStatus = 1;
        await fond.save();
      } else {
        const likeVideo = await new Fond({
          user: userId,
          video: videoId,
          author: video.user,
          fondStatus: 1,
        }).save();
        if (likeVideo) {
          // 首次喜欢视频热度+2
          await hotIncrease(videoId, 2);
        }
      }
      video.likes = await Fond.countDocuments({
        video: videoId,
        fondStatus: 1,
      });
      video.dislikes = await Fond.countDocuments({
        video: videoId,
        fondStatus: 0,
      });
      await video.save();
      response.status(200).json({data: {...video.toJSON(), islike}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 讨厌视频
  dislikes: async (request, response) => {
    try {
      const videoId = request.params.id;
      const userId = request.user._id;
      const video = await Video.findById(videoId);
      let isdislike = true;
      if (!video) return response.status(404).json({error: '视频不存在'});
      const fond = await Fond.findOne({
        user: userId,
        video: videoId,
      });
      if (fond && fond.fondStatus === 0) {
        const fondId = fond._id;
        await Fond.findByIdAndDelete(fondId);
        isdislike = false;
      } else if (fond && fond.fondStatus === 1) {
        fond.fondStatus = 0;
        await fond.save();
      } else {
        await new Fond({
          user: userId,
          video: videoId,
          author: video.user,
          fondStatus: 0,
        }).save();
      }
      video.likes = await Fond.countDocuments({
        video: videoId,
        fondStatus: 1,
      });
      video.dislikes = await Fond.countDocuments({
        video: videoId,
        fondStatus: 0,
      });
      await video.save();
      response.status(200).json({data: {...video.toJSON(), isdislike}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取喜爱视频列表
  likeList: async (request, response) => {
    try {
      const userId = request.user._id;
      let {pageNumber = 1, pageSize = 10} = request.body;
      let list = await Fond.find({
        user: userId,
        fondStatus: 1,
      })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('video', '_id title description cover vodId')
        .populate('author', 'username portrait subscribers');
      const count = await Fond.countDocuments({
        user: userId,
        fondStatus: 1,
      });
      const page = {
        pageNumber,
        pageSize,
        count,
      };
      response.status(200).json({data: {list, page}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取用户上传视频列表
  uploadList: async (request, response) => {
    try {
      let {pageNumber = 1, pageSize = 10} = request.body;
      let userId = request.user._id;
      let list = await Video.find({user: userId})
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
      const count = await Video.countDocuments({user: userId});
      const page = {
        pageNumber,
        pageSize,
        count,
      };
      response.status(200).json({data: {list, page}});
    } catch (error) {
      response.status(200).json({error: error.message});
    }
  },
  // 删除视频
  delete: async (request, response) => {
    try {
      const {id} = request.params;
      const userId = request.user._id;
      let data = await Video.findById(id);
      if (data) {
        if (data.user.equals(userId)) {
          await Video.findByIdAndDelete(id);
          response.status(200).json({data: {message: '视频删除成功'}});
        } else {
          response.status(401).json({error: '暂时无法删除视频，请稍后重试'});
        }
      } else {
        response.status(404).json({error: '视频不存在'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 修改上传视频信息
  update: async (request, response) => {
    try {
      const videoId = request.params.id;
      const userId = request.user._id;
      const video = await Video.findOne({_id: videoId, user: userId});
      if (video) {
        let params = {...request.body};
        await Video.findByIdAndUpdate(videoId, params);
        response.status(200).json({data: {message: '视频信息修改成功'}});
      } else {
        response.status(404).json({error: '视频不存在'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 收藏视频
  collect: async (request, response) => {
    try {
      const userId = request.user._id;
      const videoId = request.params.id;
      const video = await Video.findById(videoId);
      if (video) {
        let collect = await Collect.findOne({
          user: userId,
          video: videoId,
        });
        if (collect) {
          return response.status(401).json({error: '已收藏该视频'});
        }
        const collectVideo = await Collect({
          user: userId,
          video: videoId,
          author: video.user,
        }).save();
        if (collectVideo) {
          // 收藏视频+3
          await hotIncrease(videoId, 3);
        }
        response.status(200).json({data: {message: '收藏视频成功'}});
      } else {
        response.status(404).json({error: '视频不存在'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 取消收藏视频
  cancelCollection: async (request, response) => {
    try {
      const userId = request.user._id;
      const videoId = request.params.id;
      const video = await Video.findById(videoId);
      if (video) {
        const collect = await Collect.findOne({
          user: userId,
          video: videoId,
        });
        if (collect) {
          const cancelVideo = await Collect.findByIdAndDelete(collect._id);
          if (cancelVideo) {
            // 取消收藏视频-3
            await hotIncrease(videoId, -3);
          }
          response.status(200).json({data: {message: '已取消收藏该视频'}});
        } else {
          response.status(401).json({error: '未收藏该视频'});
        }
      } else {
        response.status(404).json({error: '视频不存在'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取收藏视频列表
  collectList: async (request, response) => {
    try {
      const userId = request.user._id;
      let {pageNumber = 1, pageSize = 10} = request.body;
      let list = await Collect.find({
        user: userId,
      })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('video', '_id title description cover vodId')
        .populate('author', 'username portrait subscribers');
      const count = await Collect.countDocuments({user: userId});
      const page = {
        pageNumber,
        pageSize,
        count,
      };
      response.status(200).json({data: {list, page}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取热门视频
  hotVideo: async (request, response) => {
    try {
      let list = [];
      const number = request.params.number;
      let {rank, videoList} = await hotRank(number);
      const data = await Video.find({
        _id: {$in: videoList},
      });
      for (let item of data) {
        let hots = rank[item.id];
        item = item.toJSON();
        item['hots'] = Number(hots);
        list.push(item);
      }
      response.status(200).json({data: {list}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
};
