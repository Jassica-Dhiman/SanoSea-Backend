const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/helper");
const User = require("../models/user");
require("../models/role");

exports.isAuth = async (req, res, next) => {
  const token = req.headers?.authorization;
  if (!token) return sendError(res, "Invalid token!");

  const jwtToken = token.split(" ")[1];
  if (!jwtToken) return sendError(res, "Invalid token!");

  const decode = jwt.verify(jwtToken, process.env.JWT_SECRET);
  const { userId } = decode;

  const user = await User.findById(userId).populate("roleId");
  if (!user) return sendError(res, "Invalid token, user not found!", 404);

  req.user = user;
  next();
};

exports.isAdmin = (req, res, next) => {
  const { user } = req;
  console.log(user);

  if (user.roleId?.name !== "Admin")
    return sendError(res, "Unauthorized access!");

  next();
};
