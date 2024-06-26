import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
//import Link from "@material-ui/core/Link";
import { Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";

import backgroundImage from "../back.jpg";

const useStyles = makeStyles((theme) => ({
  mainPost: {
    position: "relative",
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.common.white,
    marginBottom: theme.spacing(4),
    // backgroundImage: "url(https://source.unsplash.com/random)",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    height: "500px",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,.3)",
  },
  mainPostContent: {
    position: "relative",
    padding: theme.spacing(17),
    [theme.breakpoints.up("md")]: {
      paddingRight: 0,
    },
  },
}));

export default function MainPost(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [userRole, setUserRole] = useState("USER");

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        setIsAuthenticated(true);
        // const decodedToken = jwtDecode(token);
        // if (decodedToken && decodedToken.role) {
        //   setUserRole(decodedToken.role);
        // }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const classes = useStyles();
  const { post } = props;
  const bookingLink = isAuthenticated ? "/bookingform" : "/login";

  return (
    <Paper
      className={classes.mainPost}
      style={{ backgroundImage: `url(${post.image})` }}
    >
      {
        <img
          style={{ display: "none" }}
          src={post.image}
          alt={post.imageText}
        />
      }
      <div className={classes.overlay} />
      <Grid container>
        <Grid item md={6}>
          <div className={classes.mainPostContent}>
            <Typography
              component="h1"
              variant="h4"
              color="inherit"
              gutterBottom
            >
              {post.title}
            </Typography>
            <Typography variant="h6" color="inherit" paragraph>
              {post.description}
            </Typography>
            <Link to={bookingLink}>
              <Button
                variant="contained"
                color="secondary"
                className={classes.button}
              >
                Записаться
              </Button>
            </Link>
          </div>
        </Grid>
      </Grid>
    </Paper>
  );
}

MainPost.propTypes = {
  post: PropTypes.object,
};
