// Updated profileController.js (full file with changes)

import UserProfile from "../models/Profile.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";

export const createProfile = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);
    console.log("Authenticated user:", req.user);

    const { name, email, mobile, address, pincode, gender, dob } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !address || !pincode) {
      return res.status(400).json({ message: "All required fields (name, email, mobile, address, pincode) must be provided" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check for existing profile
    const existingProfile = await UserProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    // Check for duplicate email
    const emailExists = await UserProfile.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already in use by another profile" });
    }

    // Validate and upload profile image
    let profileImage = req.user.image || "https://via.placeholder.com/150";
    if (req.file?.path) {
      try {
        if (!fs.existsSync(req.file.path)) {
          return res.status(500).json({ message: `Uploaded file not found at ${req.file.path}` });
        }
        console.log("Multer saved file path:", req.file.path);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profileImages",
        });
        profileImage = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ message: "Failed to upload image to Cloudinary", error: uploadError.message });
      }
    }

    // Create profile
    const profile = await UserProfile.create({
      name,
      email,
      mobile,
      address,
      pincode,
      gender: gender || null,
      dob: dob ? new Date(dob) : null,
      profileImage,
      user: req.user._id,
    });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    console.error("Create profile error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate email detected", error: err.message });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("Update request body:", req.body);
    console.log("Update file:", req.file);
    console.log("Authenticated user:", req.user);
    const updatedData = { ...req.body };

    if (req.file?.path) {
      try {
        if (!fs.existsSync(req.file.path)) {
          return res.status(500).json({ message: `Uploaded file not found at ${req.file.path}` });
        }
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "profileImages",
        });
        updatedData.profileImage = result.secure_url;
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError.message);
        return res.status(500).json({ message: "Failed to upload image to Cloudinary", error: uploadError.message });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile updated", profile: updatedProfile });
  } catch (err) {
    console.error("Update profile error:", err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Duplicate email detected", error: err.message });
    }
    res.status(500).json({ message: "Update error", error: err.message });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }
    const profiles = await UserProfile.find().sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (err) {
    console.error("Fetch profiles error:", err.message);
    res.status(500).json({ message: "Error fetching profiles", error: err.message });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching profile for user ID:", id);
    console.log("Authenticated user:", req.user);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let profile = await UserProfile.findOne({ user: id });
    if (!profile) {
      // Optionally create a default profile
      profile = await UserProfile.create({
        user: id,
        name: req.user.name || "Unknown",
        email: req.user.email || "",
        mobile: "",
        address: "",
        pincode: "",
        profileImage: "https://via.placeholder.com/150",
      });
      return res.status(201).json({ message: "Profile created", profile });
    }

    if (profile.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: You can only access your own profile" });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.error("Fetch profile error:", err.message);
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

export const deleteProfile = async (req, res) => {
  try {
    console.log("Deleting profile for user ID:", req.user._id);
    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const deleted = await UserProfile.findOneAndDelete({ user: req.user._id });
    if (!deleted) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ message: "Profile deleted" });
  } catch (err) {
    console.error("Delete profile error:", err.message);
    res.status(500).json({ message: "Delete error", error: err.message });
  }
};