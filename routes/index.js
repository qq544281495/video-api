const express = require('express');
const router = new express.Router();

router.get('/', (request, response) => {
  response.status(200).json({message: 'Demo'});
});

module.exports = router;
