const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();
require("./db/dbConnect.js");

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin.js");

const app = express();

app.use(cors());

// middlewares
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);

// connecting server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on PORT " + PORT);
});
