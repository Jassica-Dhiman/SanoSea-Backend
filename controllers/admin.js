const Role = require("../models/role.js");
const User = require("../models/user.js");
const SubAdmin = require("../models/subAdmin.js");
const Doctor = require("../models/doctor.js");

const {
  sendError,
  generatePassword,
  uploadFileToCloud,
} = require("../utils/helper.js");
const { generateMailTransporter } = require("../utils/mail.js");

// * create route for sub admin
exports.create = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, roleName } = req.body;
  const { file } = req; // Capture uploaded file (only if Doctor)

  try {
    // Check for existing email
    const oldUserEmail = await User.findOne({ email });
    if (oldUserEmail) return sendError(res, "This email is already in use!");

    // Check for existing phone number
    const oldUserPhone = await User.findOne({ phoneNumber });
    if (oldUserPhone)
      return sendError(res, "This phone number is already in use!");

    // Fetch role ID from Role collection
    const role = await Role.findOne({ name: roleName });
    if (!role) return sendError(res, "Invalid role name provided!");

    // Generate a secure password automatically
    const autoGeneratedPassword = generatePassword();

    // Create new user instance
    const newUser = new User({
      fullName: lastName ? `${firstName} ${lastName}` : firstName,
      firstName,
      lastName,
      email,
      phoneNumber,
      password: autoGeneratedPassword,
      roleId: role._id,
    });

    let licenseProof = null; // Holds Doctor's license details

    // If creating a Doctor profile, handle file upload & availability
    if (roleName === "Doctor") {
      if (file.mimetype !== "application/pdf")
        return sendError(res, "Only PDF format is allowed!");

      const { url, public_id } = await uploadFileToCloud(
        file.path,
        newUser._id,
        newUser.fullName
      );
      licenseProof = { url, public_id };

      // Create Doctor profile with availability
      const doctorProfile = await Doctor.create({
        userId: newUser._id,
        licenseProof,
        // availability,
      });

      // Attach Doctor Profile reference to the User
      newUser.doctorProfile = doctorProfile._id;
    }

    // Save user details
    await newUser.save();

    // Send email notification
    const transport = generateMailTransporter();

    transport.sendMail({
      from: "admin@sanosea.com",
      to: newUser.email,
      subject: "Welcome to SanoSea App - Your Account Credentials",
      html: `
          <h1>Welcome to SanoSea App</h1>
          <p>Your new account has been successfully created!</p>
          <p>Here are your login credentials:</p>
          <ul>
              <li><strong>Email:</strong> ${newUser.email}</li>
              <li><strong>Password:</strong> ${autoGeneratedPassword}</li>
          </ul>
          <p>For security reasons, we highly recommend you reset your password after logging in.</p>
          <p>Click <a href="http://localhost:3000/auth/change-password?email=${newUser.email}">here</a> to reset your password.</p>
          <p>Thank you for joining us!</p>
          <p>Best regards,</p>
          <p>SanoSea App Team</p>
        `,
    });

    res.status(201).json({
      message: `Account Created Successfully! A temporary password has been sent to the ${roleName} email.`,
      user: newUser,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of sub-admin (Coordinator and Audit Manager)
exports.getSubAdmin = async (req, res) => {
  try {
    // Fetch the roles for Coordinator and Audit Manager
    const coordinatorRole = await Role.findOne({ name: "Coordinator" });
    const auditManagerRole = await Role.findOne({ name: "Audit Manager" });

    if (!coordinatorRole || !auditManagerRole)
      return sendError(res, "Roles not found!", 404);

    // Fetch users with the Coordinator or Audit Manager role
    const users = await User.find({
      roleId: { $in: [coordinatorRole._id, auditManagerRole._id] },
    }).populate("roleId");

    if (!users || users.length === 0)
      return res
        .status(404)
        .json({ message: "No users found for the specified roles." });

    res.status(200).json({
      message: "Users fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of Audit Manager
exports.getAuditManagers = async (req, res) => {
  try {
    // Fetch the role for Audit Manager
    const auditManagerRole = await Role.findOne({ name: "Audit Manager" });
    if (!auditManagerRole) return sendError(res, "Role not found!", 404);

    // Fetch users with the Audit Manager role
    const users = await User.find({ roleId: auditManagerRole._id }).populate(
      "roleId"
    );

    if (!users || users.length === 0)
      return res.status(404).json({ message: "No Audit Managers found." });

    res.status(200).json({
      message: "Audit Managers fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of Port Agent
exports.getPortAgents = async (req, res) => {
  try {
    // Fetch the role for Port Agent
    const portAgentRole = await Role.findOne({ name: "Port Agent" });
    if (!portAgentRole) return sendError(res, "Role not found!", 404);

    // Fetch users with the Port Agent role
    const users = await User.find({ roleId: portAgentRole._id }).populate(
      "roleId"
    );

    if (!users || users.length === 0)
      return res.status(404).json({ message: "No Port Agents found." });

    res.status(200).json({
      message: "Port Agents fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of Patient
exports.getPatients = async (req, res) => {
  try {
    // Fetch the role for Patient
    const patientRole = await Role.findOne({ name: "Patient" });
    if (!patientRole) return sendError(res, "Role not found!", 404);

    // Fetch users with the Patient role
    const users = await User.find({ roleId: patientRole._id }).populate(
      "roleId"
    );

    if (!users || users.length === 0)
      return res.status(404).json({ message: "No Patients found." });

    res.status(200).json({
      message: "Patients fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of Doctors
exports.getDoctors = async (req, res) => {
  try {
    // Fetch the role for Doctor
    const doctorRole = await Role.findOne({ name: "Doctor" });
    if (!doctorRole) return sendError(res, "Role not found!", 404);

    // Fetch users with the Doctor role
    const users = await User.find({ roleId: doctorRole._id }).populate(
      "roleId"
    );

    if (!users || users.length === 0)
      return res.status(404).json({ message: "No Doctors found." });

    res.status(200).json({
      message: "Doctors fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of General Physician
exports.getGeneralPhysician = async (req, res) => {
  try {
    // Fetch the role for Doctor
    const generalPhysicianRole = await Role.findOne({
      name: "General Physician",
    });
    if (!generalPhysicianRole) return sendError(res, "Role not found!", 404);

    // Fetch users with the General Physician role
    const users = await User.find({
      roleId: generalPhysicianRole._id,
    }).populate("roleId");

    if (!users || users.length === 0)
      return res.status(404).json({ message: "No General Physicians found." });

    res.status(200).json({
      message: "General Physicians fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * get the list of all users by role
exports.getUsersByRoles = async (req, res) => {
  const { roles } = req.query; // Expecting roles as a comma-separated string in query (e.g., ?roles=Coordinator,Audit Manager)

  try {
    if (!roles) {
      return sendError(res, "Roles are required as query parameters!", 400);
    }

    // Split roles into an array
    const roleNames = roles.split(",");

    // Fetch roles from the Role collection
    const roleDocuments = await Role.find({ name: { $in: roleNames } });
    if (roleDocuments.length === 0) {
      return sendError(res, "No matching roles found!", 404);
    }

    // Extract role IDs
    const roleIds = roleDocuments.map(role => role._id);

    // Fetch users with the specified role IDs
    const users = await User.find({ roleId: { $in: roleIds } }).populate(
      "roleId"
    );

    if (!users || users.length === 0) {
      return res.status(404).json({
        message: `No users found for the specified roles: ${roleNames.join(
          ", "
        )}.`,
      });
    }

    res.status(200).json({
      message: "Users fetched successfully!",
      users,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * delete user profile
exports.deleteUser = async (req, res) => {
  const { userId } = req.params; // User ID from request parameters

  try {
    // Check if the user exists
    const user = await User.findById(userId).populate("roleId"); // Fetch the role details along with the user
    if (!user) return sendError(res, "User not found!", 404);

    // Store the user's role before deletion
    const userRole = user.roleId.name;

    // Delete the user from the database
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: `${userRole} has been deleted successfully!`,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
