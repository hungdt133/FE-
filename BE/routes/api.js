const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Photo = require("../models/Photo");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { auth } = require("../middleware/auth");
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to check if user is the owner of a resource
const isResourceOwner = async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    
    if (photo.user_id.toString() !== req.user._id) {
      return res.status(403).json({ error: "Forbidden: You don't own this resource" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Middleware to check if user is the owner of a comment
const isCommentOwner = async (req, res, next) => {
  try {
    const { photoId, commentId } = req.params;
    const photo = await Photo.findById(photoId);
    
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    
    const comment = photo.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }
    
    if (comment.user_id.toString() !== req.user._id) {
      return res.status(403).json({ error: "Forbidden: You don't own this comment" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Login
router.post("/admin/login", async (req, res) => {
  try {
    const { login_name, password } = req.body;
    if (!login_name || !password) {
      return res.status(400).json({ error: "Missing login_name or password" });
    }
    
    const user = await User.findOne({ login_name });
    if (!user) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid login credentials" });
    }
    
    const token = user.generateToken();
    res.json({
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Register
router.post("/user", async (req, res) => {
  try {
    const {
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    } = req.body;
    
    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).json({ error: "Login name already exists" });
    }
    
    const user = new User({
      login_name,
      password,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });
    
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Logout - No need for server-side logout with JWT
router.post("/admin/logout", auth, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

// Upload photo
router.post("/photos/new", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(req.file.buffer);
    });
    
    const photo = new Photo({
      file_name: result.secure_url,
      user_id: req.user._id,
      date_time: new Date(),
      description: req.body.description || "",
    });
    
    await photo.save();
    res.json({ message: "Photo uploaded successfully", photo });
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Update photo
router.put("/photos/:photoId", auth, isResourceOwner, async (req, res) => {
  try {
    const { description } = req.body;
    const photo = await Photo.findById(req.params.photoId);
    
    photo.description = description;
    await photo.save();
    
    res.json({ message: "Photo updated successfully", photo });
  } catch (error) {
    res.status(500).json({ error: "Failed to update photo" });
  }
});

// Delete photo
router.delete("/photos/:photoId", auth, isResourceOwner, async (req, res) => {
  try {
    await Photo.findByIdAndDelete(req.params.photoId);
    res.json({ message: "Photo deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete photo" });
  }
});

// Add comment
router.post("/commentsOfPhoto/:photo_id", auth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }
    
    const photo = await Photo.findById(req.params.photo_id);
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    
    photo.comments.push({ comment, user_id: req.user._id });
    await photo.save();
    res.json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Update comment
router.put(
  "/comments/:photoId/:commentId", 
  auth, 
  isCommentOwner, 
  async (req, res) => {
    try {
      const { comment } = req.body;
      if (!comment) {
        return res.status(400).json({ error: "Comment cannot be empty" });
      }
      
      const photo = await Photo.findById(req.params.photoId);
      const commentObj = photo.comments.id(req.params.commentId);
      
      commentObj.comment = comment;
      await photo.save();
      
      res.json({ message: "Comment updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update comment" });
    }
  }
);

// Delete comment
router.delete(
  "/comments/:photoId/:commentId", 
  auth, 
  isCommentOwner, 
  async (req, res) => {
    try {
      const photo = await Photo.findById(req.params.photoId);
      photo.comments.id(req.params.commentId).remove();
      await photo.save();
      
      res.json({ message: "Comment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  }
);

// Get user photos
router.get("/photosOfUser/:user_id", auth, async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.user_id }).populate("user_id");
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photos" });
  }
});

// Get photo details
router.get("/photo/:photo_id", auth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photo_id)
      .populate("user_id")
      .populate("comments.user_id");
      
    if (!photo) {
      return res.status(404).json({ error: "Photo not found" });
    }
    
    res.json(photo);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch photo details" });
  }
});

// Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update photo image
router.put(
  "/photos/:photoId/image",
  auth,
  isResourceOwner,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    try {
      const result = await cloudinary.uploader
        .upload_stream({ resource_type: "image" }, async (error, result) => {
          if (error) {
            return res.status(400).json({ error: "Upload failed" });
          }
          
          const photo = await Photo.findById(req.params.photoId);
          photo.file_name = result.secure_url;
          await photo.save();
          
          res.json({ message: "Photo image updated successfully", photo });
        })
        .end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ error: "Failed to update photo image" });
    }
  }
);

module.exports = router;
