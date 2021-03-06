const express = require("express"),
  router = express.Router();
const { Article, validateArticle } = require("../models/article");
const { User } = require("../models/user");
const multer = require('multer');
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const articles = await Article.find().sort("title");
  res.send(articles);
});

router.get("/:id", async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article)
    return res.status(404).send("The article with the given ID was not found.");

  res.send(article);
});

 //define storage for the images
  const storage = multer.diskStorage({
    //destination for files
    destination: function (req, file, callback) {
      callback(null, "./uploads/images");
    },

    //add the image extension
    filename: function (req, file, callback) {
      callback(null, Date.now+file.originalname);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fieldSize:1024*1024*3
    }
  })

router.post("/", auth, async (req, res) => {
  const { error } = validateArticle(req.body);
  if (error) return res.status(400).send(error.details[0].message);

   const user = await User.findById(req.body.userId);
  if (!user) return res.status(400).send("Invalid user");

    function slugify(val) {
      return val
        ?.toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[\s\W-]+/g, "-"); // Replace spaces, non-word characters and dashes with a single dash (-)
  }
  
 

  const article = new Article({
    title: req.body.title,
    body: req.body.body,
    author: req.body.author,
    thumb:req.body.thumb,
    slug:slugify(req.body.title)
  });

  await article.save();
  res.send(article);
});
module.exports = router;
