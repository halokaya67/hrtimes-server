const router = require("express").Router();
const ArticleModel = require("../models/Article.model");
const UserModel = require("../models/User.model");
const CommentModel = require("../models/Comment.model");

router.get("/articles", (req, res) => {
  ArticleModel.find()
    .populate("author")
    .populate("comments")
    .then((articles) => {
      res.status(200).json(articles);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Something went wrong",
        message: err,
      });
    });
});

router.get("/article/:id", (req, res) => {
  const { id } = req.params;

  ArticleModel.findById(id)
    .populate("author")
    .populate("comments")
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: "Something went wrong",
        message: err,
      });
    });
});

router.post("/create", (req, res, next) => {
  const { section, subsection, title, body, created_date, image } = req.body;
  const { _id } = req.session.loggedInUser;
  ArticleModel.create({
    section: section,
    subsection: subsection,
    title: title,
    body: body,
    created_date: created_date,
    author: _id,
    image: image,
  }).then((response) => {
    UserModel.findByIdAndUpdate(_id, {
      $push: { articles: response._id },
    }).then(() => {
      res.status(200).json(response);  
    })   
  }).catch ((err) => {
    res.status(500).json({
      error: "Something went wrong",
      message: err,
    });
  });
});

router.delete("/article/:id", (req, res) => {
  const { id } = req.params;
  const { _id } = req.session.loggedInUser;

  let articleComments = [];
  ArticleModel.findById(id)
    .then((article) => {
      articleComments = article.comments;

      let myPromises = [];
      articleComments.forEach((comment) => {
        myPromises.push(
          UserModel.findOneAndUpdate(
            { comments: { $in: [comment] } },
            { $pull: { comments: comment } }
          )
        );
        myPromises.push(CommentModel.findByIdAndDelete(comment._id));
      });
      myPromises.push(ArticleModel.findByIdAndDelete(id));
      myPromises.push(
        UserModel.findByIdAndUpdate(_id, { $pull: { articles: { $in: [id] } } })
      );

      Promise.all(myPromises)
        .then(() => {
          res.status(200).json({});
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.patch("/article/:id/edit", (req, res) => {
  let id = req.params.id;
  let { section, subsection, title, body, created_date, image } = req.body;
  console.log(req.body);
  if (!image) {
    ArticleModel.findById(id)
      .then((result) => {
        image = result.image;
        console.log(image);
        ArticleModel.findByIdAndUpdate(
          id,
          { $set: { section, subsection, title, body, created_date, image } },
          { new: true }
        );
      })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: "Something went wrong",
          message: err,
        });
      });
  }
});

module.exports = router;
