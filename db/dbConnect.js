const mongoose = require("mongoose");

// connect
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB Connected Successfully");
  })
  .catch(er => {
    console.log("DB Connection Failed", er);
  });
