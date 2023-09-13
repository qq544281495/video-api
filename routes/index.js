var express = require("express");
var router = express.Router();

router.get("/", (request, response) => {
  response.status(200).json({ message: "Demo" });
});

module.exports = router;
