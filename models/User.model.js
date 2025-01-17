const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  image: {
    type: String,
    default: "/+media/user.png",
  },
  passwordHash: {
    type: String,
  },
  interests: {
    type: Array,
  },
  articles: [{
    type: Schema.Types.ObjectId,
    ref: "Article",
  }],
  comments: [{
    type: Schema.Types.ObjectId,
    ref: "Comment",
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: "Article"
  }],
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "Article"
  }],
  dislikes: [{
    type: Schema.Types.ObjectId,
    ref: "Article"
  }],
  googleId: String,
});

const User = model("User", userSchema);

module.exports = User;
