const mongoose = require("mongoose");
const Profile = mongoose.model(
  "Profile",
  new mongoose.Schema({
    name: String,
    image: String,
    dob: String,
    education: String,
    userId: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    
  })
);
module.exports = Profile;
