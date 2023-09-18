const User = require('../models/userSchema'); // 用户数据模型
const Channel = require('../models/channelSchema'); // 频道数据模型
const {signToken} = require('../util/jwt'); // 生成用户登录凭证
const operate = require('../util/operate'); // 文件操作工具类
const lodash = require('lodash');

// 保存头像
async function savePortrait(id, filename, originalname) {
  let extension = originalname.split('.').pop();
  let portrait = `${filename}.${extension}`;
  await operate.rename(`./public/${filename}`, `./public/${portrait}`);
  await User.findByIdAndUpdate(id, {portrait});
}

module.exports = {
  // 用户注册
  register: async (request, response) => {
    try {
      const user = new User(request.body);
      await user.save();
      response.status(200).json({data: {message: '用户注册成功'}});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 用户登录
  login: async (request, response) => {
    try {
      const params = request.body;
      const user = await User.findOne(params);
      if (user) {
        const data = user.toJSON();
        data.token = await signToken(data);
        response.status(200).json({data});
      } else {
        response.status(402).json({error: '邮箱或密码错误'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 修改用户密码
  password: async (request, response) => {
    try {
      const {_id, email} = request.user;
      const data = request.body;
      const user = await User.findOne({
        email,
        password: data.current_password,
      });
      if (!user) {
        return response.status(401).json({error: '邮箱或密码错误'});
      }
      if (data.password === data.confirmation_password) {
        let password = data.password;
        await User.findByIdAndUpdate(_id, {password});
        response.status(200).json({data: {message: '密码修改成功'}});
      } else {
        console.log(data.password === data.confirmation_password);
        response.status(401).json({error: '两次输入密码不一致'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取用户列表
  list: async (request, response) => {
    try {
      const {pageNumber = 1, pageSize = 10} = request.body;
      const list = await User.find()
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize);
      const count = await User.countDocuments();
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
  // 上传头像
  portrait: async (request, response) => {
    try {
      let {_id} = request.user;
      const user = await User.findById(_id);
      let {filename, originalname} = request.file;
      if (user.portrait) {
        if (await operate.exists(`./public/${user.portrait}`)) {
          // 用户信息存在头像且服务器本地存有头像文件(删除原有头像上传新头像)
          await operate.delete(`./public/${user.portrait}`);
          savePortrait(_id, filename, originalname);
          response.status(200).json({data: {message: '头像修改成功'}});
        } else {
          // 用户信息存在头像但服务器本地丢失或不存在头像文件(上传新头像)
          savePortrait(_id, filename, originalname);
          response.status(200).json({data: {message: '头像修改成功'}});
        }
      } else {
        savePortrait(_id, filename, originalname);
        response.status(200).json({data: {message: '头像修改成功'}});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 订阅频道
  subscribe: async (request, response) => {
    try {
      let userId = request.user._id;
      let channelId = request.params.id;
      if (userId === channelId) {
        return response.status(401).json({error: '不能关注自己'});
      }
      let channelUser = await User.findById(channelId);
      if (!channelUser) {
        return response.status(404).json({error: '关注的频道不存在'});
      }
      let channel = await Channel.findOne({
        user: userId,
        channel: channelId,
      });
      if (channel) {
        response.status(401).json({error: '你已关注此频道'});
      } else {
        await new Channel({
          user: userId,
          channel: channelId,
        }).save();
        channelUser.subscribers++;
        await channelUser.save();
        response.status(200).json({data: {message: '关注频道成功'}});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 取消订阅频道
  unsubscribe: async (request, response) => {
    try {
      let userId = request.user._id;
      let channelId = request.params.id;
      if (userId === channelId) {
        return response.status(401).json({error: '不能取关自己'});
      }
      let channelUser = await User.findById(channelId);
      if (!channelUser) {
        return response.status(404).json({error: '取关的频道不存在'});
      }
      let channel = await Channel.findOne({
        user: userId,
        channel: channelId,
      });
      if (channel) {
        await Channel.findByIdAndDelete(channel._id);
        channelUser.subscribers--;
        await channelUser.save();
        response.status(200).json({data: {message: '取关频道成功'}});
      } else {
        response.status(401).json({error: '你未订阅此频道'});
      }
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取频道详情
  channelDetail: async (request, response) => {
    try {
      // 登录凭证（判断是否登录）
      let certificate = request.user;
      // 频道主ID
      let channelId = request.params.id;
      let subscriber = false;
      const data = await User.findById(channelId);
      if (!data) {
        return response.status(404).json({error: '频道不存在'});
      }
      if (certificate) {
        let userId = request.user._id;
        const channel = await Channel.findOne({
          user: userId,
          channel: channelId,
        });
        if (channel) {
          subscriber = true;
        }
      }
      const channelInfo = lodash.pick(data, [
        '_id',
        'username',
        'portrait',
        'subscribers',
      ]);
      response.status(200).json({
        data: {
          ...channelInfo,
          subscriber,
        },
      });
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
  // 获取用户订阅频道列表
  subscribeList: async (request, response) => {
    try {
      const id = request.params.id;
      const user = await User.findById(id);
      let {pageNumber = 1, pageSize = 10} = request.body;
      if (!user) {
        return response.status(404).json({error: '用户不存在'});
      }
      const data = await Channel.find({
        user: id,
      })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('channel');
      let list = data.map((item) => {
        return lodash.pick(item.channel, [
          '_id',
          'username',
          'portrait',
          'subscribers',
        ]);
      });
      const count = await Channel.countDocuments({user: id});
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
  // 获取频道订阅列表
  channelList: async (request, response) => {
    try {
      const {_id} = request.user;
      let {pageNumber = 1, pageSize = 10} = request.body;
      const data = await Channel.find({
        channel: _id,
      })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .populate('user');
      let list = data.map((item) => {
        return lodash.pick(item.user, [
          '_id',
          'username',
          'portrait',
          'subscribers',
        ]);
      });
      const count = await Channel.countDocuments({channel: _id});
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
