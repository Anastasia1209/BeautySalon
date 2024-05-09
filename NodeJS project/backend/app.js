require("dotenv").config({ path: ".env" });
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const cors = require("cors");

const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const authRoute = require("./Routes/authRoute");
const servRoute = require("./Routes/serviceRoute");
const revRoute = require("./Routes/reviewRoute");
const emplRoute = require("./Routes/employeeRoute");
const bookingRoute = require("./Routes/bookingRoute");
const app = express();

app.use(cors());

app.use(cookieParser());
app.use(express.json());
app.use("/auth", authRoute);
app.use("/serv", servRoute);
app.use("/rev", revRoute);
app.use("/empl", emplRoute);
app.use("/book", bookingRoute);

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prismaClient.user.findFirst({
        where: {
          username: username,
        },
      });
      console.log(user);
      if (!user || user.password !== password) {
        return done(null, false, {
          message: "Incorrect username or password.",
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
  console.log("HELLO" + user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });
    console.log("USER:" + user.username);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// app.use (
//     Fingerprint({
//         parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
//     })
// );
app.get("/", (req, res) => {
  res.send("Добро пожаловать в салон красоты");
});

app.listen(5000, () =>
  console.log(`Server running at http://localhost:${5000}\n`)
);
