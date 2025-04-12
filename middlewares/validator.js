const { check, validationResult } = require("express-validator");

exports.userValidator = [
  // Validate firstName (required)
  check("firstName")
    .trim()
    .not()
    .isEmpty()
    .withMessage("First name is missing!")
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long!"),

  // Validate lastName (optional, but if provided, it should be valid)
  check("lastName")
    .optional() // Make lastName optional
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long!"),

  // Validate phoneNumber (required, should be numeric)
  check("phoneNumber")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Phone number is missing!")
    .isNumeric()
    .withMessage("Phone number must be numeric!")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits!"),

  // Validate email (required, must be valid email format)
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Email is invalid!")
    .not()
    .isEmpty()
    .withMessage("Email is missing!"),

  // Validate password (required, must be 8-20 characters)
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is missing!")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be 8 to 20 characters long!")
    .matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one digit, and one special character!"
    ),

  // Validate officeAddress (optional, trim whitespace)
  check("officeAddress")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Office address must be at least 5 characters long!"),

  // Validate roleId (optional, but must be a valid MongoDB ObjectId if provided)
  check("roleId").optional().isMongoId().withMessage("Invalid roleId!"),
];

// minimize the error length
exports.validate = (req, res, next) => {
  const error = validationResult(req).array();

  if (error.length) return res.json({ error: error[0].msg });

  next();
};

// checking the email, password is valid for Sign IN
exports.signInValidator = [
  check("email").normalizeEmail().isEmail().withMessage("Email is invalid!"),
  check("password").trim().not().isEmpty().withMessage("Password is missing!"),
];
