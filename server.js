require("dotenv").config();
const passwordReset = require("./app/routes/passwordReset");
const users = require("./app/routes/users");
const connection = require("./app/config/db.config");
const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");
const passport = require("passport");
const flash = require("express-flash");
const UserService = require("./app/user");
const bodyParser = require("body-parser");
const session = require("express-session");
require("./app/config/passport");
// require("./app/config/local");
require("./app/config/google");

const app = express();

// parse requests of content-type - application/json
app.use(express.json());


app.use(cors())


// var corsOptions = {
//   origin: "http://localhost:8080"
// };

// app.use(cors(corsOptions));



// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use("/api/users", users);
app.use("/api/password-reset", passwordReset);
app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.engine("html", require("ejs").renderFile);
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "secr3t",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.get("/g", (req, res) => {
  res.render("google.ejs");
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile.ejs", { user: req.user });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/g",
    successRedirect: "/profile",
    failureFlash: true,
    successFlash: "Successfully logged in!",
  })
);

app.get("/auth/logout", (req, res) => {
  req.flash("success", "Successfully logged out");
  req.session.destroy(function () {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

app.post("/auth/local/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  if (password.length < 8) {
    req.flash("error", "Account not created. Password must be 7+ characters long");
    return res.redirect("/local/signup");
  }


  try {
    await UserService.addLocalUser({
      id: uuid.v4(),
      email,
      firstName: first_name,
      lastName: last_name,
      password: password
    })
  } catch (e) {
    req.flash("error", "Error creating a new account. Try a different login method.");
    res.redirect("/local/signup")
  }

  res.redirect("/local/signin")
});

app.post("/auth/local/signin",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/local/signin",
    failureFlash: true
  })
);

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  // res.json({ message: "Welcome to test application." });
  res.render("index.ejs");
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}