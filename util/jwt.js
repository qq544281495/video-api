const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const {UUID} = require('../config/index');

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

module.exports.signToken = async (user) => {
  const token = await sign(user, UUID, {expiresIn: 60 * 60 * 24});
  return token;
};

module.exports.verifyToken = function (requried = true) {
  return async (request, response, next) => {
    let token = request.headers.authorization;
    token = token ? token.split('Bearer ')[1] : null;
    if (token) {
      try {
        const user = await verify(token, UUID);
        request.user = user;
        next();
      } catch (error) {
        response.status(402).json({error: '用户身份验证失败，请重新登录'});
      }
    } else if (requried) {
      response.status(402).json({error: '请登录后操作'});
    } else {
      next();
    }
  };
};
