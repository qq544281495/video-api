const Video = require('../models/videoSchema'); // 视频数据模型
const Comment = require('../models/commentSchema'); // 评论数据模型
const Fond = require('../models/fondSchema'); // 喜爱视频数据模型

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
        await new Comment({
          user: userId,
          video: videoId,
          content,
        }).save();
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
        islike = false;
      } else if (fond && fond.fondStatus === 0) {
        fond.fondStatus = 1;
        await fond.save();
      } else {
        await new Fond({
          user: userId,
          video: videoId,
          author: video.user,
          fondStatus: 1,
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
};
