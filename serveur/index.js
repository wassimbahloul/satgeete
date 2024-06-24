const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const cloudinary = require(path.resolve(__dirname, './config/cloudinary'));
const Formation = require('./Models/Formation');
const Course = require('./Models/Course'); // Importer le modèle Course

mongoose.connect("mongodb://127.0.0.1:27017/stage");

const app = express();

app.use(express.json());
app.use(cors());

// Vérification de la configuration Cloudinary
console.log('Cloudinary Config:', JSON.stringify(cloudinary.config(), null, 2));

// Configuration de multer avec Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'formations', // Le dossier où les images seront stockées sur Cloudinary
    format: async (req, file) => 'jpg', // Format des images
    public_id: (req, file) => file.originalname, // Nom public sur Cloudinary
  },
});

const upload = multer({ storage: storage });

// Route pour créer une nouvelle formation avec upload d'image
app.post("/createformation", upload.single('image'), (req, res) => {
    const { title, description, category, duration, level } = req.body;
  
    // Check if required fields are missing
    if (!title || !description || !category || !duration || !level || !req.file) {
      return res.status(400).json({ message: "Missing required fields or image file" });
    }
  
    // Create a new Formation instance
    const newFormation = new Formation({
      title,
      description,
      category,
      duration,
      level,
      image: req.file.path, // Assuming req.file.path is correct
    });
  
    // Save the new Formation instance
    newFormation.save()
      .then(formation => res.json(formation))
      .catch(err => {
        console.error('Error saving formation:', err);
        res.status(500).json({ message: "Error saving formation", error: err });
      });
  });
  

// Autres routes
app.get("/formations", (req, res) => {
  Formation.find({})
    .then(formations => res.json(formations))
    .catch(err => res.status(400).json({ message: "Error fetching formations", error: err }));
});

app.get("/formation/:id", (req, res) => {
  const id = req.params.id;
  Formation.findById(id)
    .then(formation => {
      if (!formation) {
        return res.status(404).json({ message: "Formation not found" });
      }
      res.json(formation);
    })
    .catch(err => res.status(400).json({ message: "Error fetching formation", error: err }));
});
app.put("/updateformation/:id", (req, res) => {
    const id = req.params.id;
    Formation.findByIdAndUpdate(id, req.body, { new: true })
        .then(formation => {
            if (!formation) {
                return res.status(404).json({ message: "Formation not found" });
            }
            res.json(formation);
        })
        .catch(err => res.status(400).json({ message: "Error updating formation", error: err }));
});

app.delete("/deleteformation/:id", (req, res) => {
  const id = req.params.id;
  Formation.findByIdAndDelete(id)
    .then(formation => {
      if (!formation) {
        return res.status(404).json({ message: "Formation not found" });
      }
      res.json({ message: "Formation deleted successfully" });
    })
    .catch(err => res.status(400).json({ message: "Error deleting formation", error: err }));
});

//crud course

// Configuration de multer avec CloudinaryStorage pour les vidéos
const storageVideos = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'courses_videos', // Optionnel: Peut être utilisé pour nommer un dossier dans votre Cloudinary Dashboard
    resource_type: 'video',   // Spécifie le type de ressource (image, video, raw)
    allowed_formats: ['mp4', 'webm','avi'], // Formats autorisés pour les vidéos
    // Vous pouvez ajouter d'autres options ici
  },
});

const uploadVideos = multer({ storage: storageVideos });

// Route pour créer une nouvelle course avec upload de vidéos et URLs de vidéos
app.post("/createcourse", uploadVideos.array('videos', 10), async (req, res) => {
  const { formationId, nom, explication, videoUrls } = req.body;

  // Vérifiez si des fichiers vidéos ou des URLs sont bien présents
  if ((!req.files || req.files.length === 0) && (!videoUrls || videoUrls.length === 0)) {
    return res.status(400).json({ message: "No video files or URLs provided" });
  }

  // Map des fichiers uploadés pour extraire l'URL et l'ID public de Cloudinary
  const videos = req.files.map(file => ({
    url: file.path,
    public_id: file.filename, // Utiliser le filename pour identifier les fichiers sur Cloudinary
  }));

  // Ajout des URLs de vidéos directement fournies
  if (videoUrls && typeof videoUrls === 'string') {
    videos.push({ url: videoUrls, public_id: 'url_video' });
  } else if (videoUrls && Array.isArray(videoUrls)) {
    videoUrls.forEach(url => {
      videos.push({ url: url, public_id: 'url_video' });
    });
  }

  try {
    // Créer une nouvelle course en incluant les informations nécessaires
    const newCourse = new Course({
      formation: formationId,
      nom,
      videos,
      explication,
    });

    const savedCourse = await newCourse.save();
    res.json(savedCourse);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ message: "Error creating course", error: err });
  }
});

// Route pour mettre à jour une course par ID
app.put("/updatecourse/:id", uploadVideos.array('videos', 10), async (req, res) => {
  const id = req.params.id;
  const { formationId, nom, explication } = req.body;

  // Si des fichiers sont uploadés, map les fichiers pour extraire l'URL et l'ID public de Cloudinary
  const videos = req.files.map(file => ({
    url: file.path,
    public_id: file.filename,
  }));

  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { formation: formationId, nom, videos, explication },
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(updatedCourse);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ message: "Error updating course", error: err });
  }
});

// Route pour supprimer une course par ID
app.delete("/deletecourse/:id", (req, res) => {
  const id = req.params.id;
  Course.findByIdAndDelete(id)
    .then(course => {
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({ message: "Course deleted successfully" });
    })
    .catch(err => res.status(400).json({ message: "Error deleting course", error: err }));
});
// Route pour obtenir les cours par formation ID
app.get("/formation/:formationId/courses", (req, res) => {
  const formationId = req.params.formationId;
  
  Course.find({ formation: formationId })
    .populate('formation') // Populer la référence de formation si besoin
    .then(courses => {
      if (!courses || courses.length === 0) {
        return res.status(404).json({ message: "No courses found for this formation" });
      }
      res.json(courses);
    })
    .catch(err => res.status(400).json({ message: "Error fetching courses", error: err }));
});










app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
