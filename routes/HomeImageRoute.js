const express = require("express");
const router = express.Router();
const Image = require("../models/homeImges");
const { upload } = require("../configCloudinary"); // Ensure correct import

router.post("/upload", upload.array("images", 6), async (req, res) => {
    try {
        console.log("Received files:", req.files); // Debugging line

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "No images uploaded" });
        }

        const imageUrls = req.files.map(file => file.path); // Cloudinary URLs

        const existingImages = await Image.find();
        if (existingImages.length > 0) {
            await Image.deleteMany({});
        }

        const newImages = imageUrls.map(url => ({ imageUrl: url }));
        await Image.insertMany(newImages);

        res.status(200).json({ message: "Images Uploaded Successfully", images: newImages });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
