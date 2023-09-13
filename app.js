const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./routes/index");

const app = express();
// 中间件
app.use(express.json());
app.use(express.static("public"));
app.use(cors()); // 跨域
app.use(morgan("dev")); // 日志
app.use("/api", router); // 路由

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
