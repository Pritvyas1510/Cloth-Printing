// Updated profileController.js (full file with changes)

import UserProfile from "../models/Profile.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import mongoose from "mongoose";

// CREATE PROFILE
export const createProfile = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    const { name, email, mobile, address, pincode, gender, dob } = req.body;

    if (!name || !email || !mobile || !address || !pincode) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const existingProfile = await UserProfile.findOne({ user: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists for this user" });
    }

    const emailExists = await UserProfile.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    let profileImage = "https://via.placeholder.com/150";
    let profileImageId = null;

    if (req.file) {
      profileImage = req.file.path;       // secure_url
      profileImageId = req.file.filename; // public_id
    }

    const profile = await UserProfile.create({
      name,
      email,
      mobile,
      address,
      pincode,
      gender: gender || null,
      dob: dob ? new Date(dob) : null,
      profileImage,
      profileImageId,
      user: req.user._id,
    });

    res.status(201).json({ message: "Profile created", profile });
  } catch (err) {
    console.error("Create profile error:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    console.log("Update body:", req.body);
    console.log("Update file:", req.file);

    if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const profile = await UserProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const updatedData = { ...req.body };

    if (req.file) {
      // delete old Cloudinary image if exists
      if (profile.profileImageId) {
        await cloudinary.uploader.destroy(profile.profileImageId);
      }

      updatedData.profileImage = req.file.path;       // secure_url
      updatedData.profileImageId = req.file.filename; // public_id
    }

    const updatedProfile = await UserProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Profile updated", profile: updatedProfile });
  } catch (err) {
    console.error("Update profile error:", err.message);
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