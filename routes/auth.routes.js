const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserModel = require("../models/User.model");

// Handling SIGNUP route
router.post("/signup", (req, res) => {
  // Destructuring data from body
  const {
    username,
    firstName,
    lastName,
    email,
    country,
    city,
    image,
    passwordHash,
    interests,
    comments,
    articles,
  } = req.body;

  // Throwing an error if one of the data is missing
  if (
    !username ||
    !email ||
    !passwordHash ||
    !firstName ||
    !lastName ||
    !city ||
    !country ||
    !image ||
    interests.length === 0
  ) {
    res.status(500).json({
      error: "Please enter all fields",
    });
    return;
  }

  // Checking the email structure
  const myRegex = new RegExp(
    /^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/
  );

  // Throwing an error if the email structure is not correct
  if (!myRegex.test(email)) {
    res.status(500).json({
      error: "Email format not correct",
    });

    return;
  }

  // Checking the password structure
  // const myPassRegex = new RegExp(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  // );
  // if (!myPassRegex.test(passwordHash)) {
  //   res.status(500).json({
  //     errorMessage:
  //       "Password needs to have 8 characters, a number and an Uppercase alphabet",
  //   });
  //   return;
  // }

  // Creating a hashed password
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(passwordHash, salt);

  // Creating a user with the data above
  UserModel.create({
    username,
    firstName,
    lastName,
    email,
    country,
    city,
    image,
    passwordHash: hash,
    interests,
    comments,
    articles,
  })
    // Creating a session with the user data
    .then((user) => {
      user.passwordHash = "***";
      req.session.loggedInUser = user;
      res.status(200).json(user);
    })
    // Handling the error
    .catch((err) => {
      // Throwing an error if email isn't unique
      if (err.code === 11000) {
        res.status(500).json({
          error: "Username or email entered already exists!",
          message: err,
        });
      } else {
        // Throwing an error if user can't created
        res.status(500).json({
          error: "User couldn't created!",
          message: err,
        });
      }
    });
});

// Handling SIGNIN route
router.post("/signin", (req, res) => {
  // Destructuring data from body
  const { email, password } = req.body;

  // Throwing an error if data is missing
  if (!email || !password) {
    res.status(500).json({
      error: "Please enter your email and password",
    });
    return;
  }

  // Checking the email structure
  const myRegex = new RegExp(
    /^[a-z0-9](?!.*?[^\na-z0-9]{2})[^\s@]+@[^\s@]+\.[^\s@]+[a-z0-9]$/
  );
  // Throwing an error if the email structure is not correct
  if (!myRegex.test(email)) {
    res.status(500).json({
      error: "Please enter a correct email format",
    });
    return;
  }

  // Finding the details of the user
  UserModel.findOne({ email })
    .then((userData) => {
      // Checking if the password matches
      bcrypt.compare(password, userData.passwordHash)
        // Creating a session with the user data if it matches
        .then((doesItMatch) => {
          if (doesItMatch) {
            userData.passwordHash = "***";
            req.session.loggedInUser = userData;
            res.status(200).json(userData);
          } else {
            res.status(500).json({
              error: "Invalid password",
            });
            return;
          }
        })
        .catch(() => {
          res.status(500).json({
            error: "Invalid email",
          });
          return;
        });
    })
    .catch((err) => {
      res.status(500).json({
        error: "Email does not exist",
        message: err,
      });
      return;
    });
});

router.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(204).json({});
});

const isLoggedIn = (req, res, next) => {
  if (req.session.loggedInUser) {
    next();
  } else {
    res.status(401).json({
      message: "Unauthorized user",
      code: 401,
    });
  }
};

router.get("/profile", isLoggedIn, (req, res, next) => {
  UserModel.findById(req.session.loggedInUser._id)
    .populate("comments")
    .populate("articles")
    .populate("following")
    .then((response) => {
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        error: "User couldn't found",
        message: err,
      });
    });
});

module.exports = router;
