const bcrypt = require("bcrypt");

require("dotenv").config();

// Connect to the database
require("../db/dbConnect.js");

// Import necessary models
const Role = require("../models/role.js"); // Role schema
const User = require("../models/user.js"); // User schema

const mongoose = require("mongoose");

// Seed data for roles
const roles = [
  "Admin",
  "Patient",
  "General Physician",
  "Audit Manager",
  "Doctor",
  "Port Agent",
  "Coordinator",
];

// Function to seed roles and create admin account
const seedDatabase = async () => {
  try {
    // Insert roles into the database
    const existingRoles = await Role.find();

    if (existingRoles.length === 0) {
      await Role.insertMany(roles.map(name => ({ name })));
      console.log("Roles inserted successfully!");
    } else {
      console.log("Roles already exist, skipping role insertion.");
    }

    // Find the Admin role
    const adminRole = await Role.findOne({ name: "Admin" });

    // Create an admin account if it doesn't exist
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (!existingAdmin) {
      const adminData = {
        firstName: "Super",
        lastName: "Admin",
        // fullName: "Super Admin",
        phoneNumber: "1234567890",
        email: "admin@example.com",
        password: "admin@123",
        officeAddress: "123 Admin Street",
        isVerified: true,
        roleId: adminRole._id, // Reference to Role schema
      };

      await User.create(adminData);
      console.log("Admin account created successfully!");
    } else {
      console.log("Admin account already exists, skipping admin creation.");
    }

    // Exit the process
    mongoose.disconnect();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error seeding database:", error.message);
    mongoose.disconnect();
  }
};

// Run the seed function
seedDatabase();
