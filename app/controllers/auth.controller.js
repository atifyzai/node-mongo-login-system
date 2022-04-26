const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Profile = db.profile;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { user } = require("../models");
const { profile } = require("../models");
exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password //bcrypt.hashSync(req.body.password, 8)
  });
  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};
exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      if(req.body.password != user.password){
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }
      // var passwordIsValid = bcrypt.compareSync(
      //   req.body.password,
      //   user.password
      // );
      // if (!passwordIsValid) {
      //   return res.status(401).send({
      //     accessToken: null,
      //     message: "Invalid Password!"
      //   });
      // }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      var authorities = [];
      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};

exports.profile = async (req, res) => {
  
    const prof = await Profile.findOne({userId:req.body.user_id});
    if (!prof) 
    {
      const profile = new Profile({
        name: req.body.name,
        image: req.body.image,
        dob: req.body.DOB,
        education: req.body.education,
        userId: req.body.user_id
      });
      profile.save((err, profile) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }
        res.send({ message: "Profile updated successfully!" });
      });
    }

    prof.name= req.body.name;
    prof.image= req.body.image;
    prof.dob= req.body.DOB;
    prof.education= req.body.education;
    prof.userId= req.body.user_id;
    await prof.save();

    res.send("profile updated sucessfully.");
  
};

