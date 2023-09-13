const express = require('express');
const router = new express.Router();

router.get('/', (request, response) => {
  response.status(200).json({message: '视频接口'});
});

module.exports = router;
