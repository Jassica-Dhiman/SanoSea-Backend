const express = require("express");
const { isAuth, isAdmin } = require("../middlewares/auth");
const {
  create,
  getSubAdmin,
  getAuditManagers,
  getPortAgents,
  getPatients,
  getDoctors,
  getGeneralPhysician,
  getUsersByRoles,
  deleteUser,
} = require("../controllers/admin");

const adminRouter = express.Router();

adminRouter.post("/create", isAuth, isAdmin, create);

adminRouter.get("/sub-admin-list", isAuth, getSubAdmin);
adminRouter.get("/audit-manager-list", isAuth, getAuditManagers);
adminRouter.get("/port-agent-list", isAuth, getPortAgents);
adminRouter.get("/patient-list", isAuth, getPatients);
adminRouter.get("/doctors-list", isAuth, getDoctors);
adminRouter.get("/general-physician-list", isAuth, getGeneralPhysician);

adminRouter.get("/users-by-roles", isAuth, getUsersByRoles);

adminRouter.delete("/users/:userId", isAuth, deleteUser);

module.exports = adminRouter;
