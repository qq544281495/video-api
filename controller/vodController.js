const RPCClient = require('@alicloud/pop-core').RPCClient;

function initVodClient(accessKeyId, accessKeySecret) {
  let regionId = 'cn-shanghai';
  let client = new RPCClient({
    accessKeyId: accessKeyId,
    accessKeySecret: accessKeySecret,
    endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
    apiVersion: '2017-03-21',
  });

  return client;
}

module.exports = {
  getUploadVod: async (request, response) => {
    let client = initVodClient(
      '阿里云VODaccessKeyId',
      '阿里云VODaccessKeySecret'
    );
    try {
      const data = await client.request(
        'CreateUploadVideo',
        {
          Title: 'this is a title',
          FileName: 'filename.mp4',
        },
        {}
      );
      response.status(200).json({data});
    } catch (error) {
      response.status(500).json({error: error.message});
    }
  },
};
