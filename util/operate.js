const fs = require('fs');
const {promisify} = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const renameFile = promisify(fs.rename);
const deleteFile = promisify(fs.unlink);
const existsFile = promisify(fs.exists);

module.exports = {
  // 读取文件
  read: async (url) => {
    try {
      let data = await readFile(url, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  // 写入文件
  write: async (url, content) => {
    try {
      let data = JSON.stringify(content);
      return await writeFile(url, data);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  // 文件重命名
  rename: async (fileName, changeName) => {
    try {
      return await renameFile(fileName, changeName);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  // 删除文件
  delete: async (url) => {
    try {
      return await deleteFile(url);
    } catch (error) {
      throw new Error(error.message);
    }
  },
  // 判断文件是否存在
  exists: async (url) => {
    try {
      return await existsFile(url);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
