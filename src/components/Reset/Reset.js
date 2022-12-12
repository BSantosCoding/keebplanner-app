import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { sendPwResetEmail } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import { Button, Card, CardContent, Grid } from "@mui/material";
import { Typography, TextField } from "@mui/material";

function Reset() {
  const [email, setEmail] = useState("");
  const { user, loading } = useContext(AuthContext);
  const history = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) history("/dashboard", { replace: true });
  }, [user, loading, history]);
  return (
    <Grid
      container
      spacing={2}
      justifyContent="center"
      alignItems="center"
      sx={{ height: "100vh" }}
    >
      <Grid item>
        <Card sx={{ maxWidth: "350px" }}>
          <CardContent>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Grid container item justifyContent="center">
                <Typography variant="h4">Reset Password</Typography>
              </Grid>
              <Grid container item>
                <TextField
                  sx={{ width: "100%" }}
                  label="Email"
                  id="typeEmail"
                  variant="standard"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />{" "}
              </Grid>
              <Grid container item justifyContent="center">
                <Button
                  variant="contained"
                  onClick={() => sendPwResetEmail(email)}
                >
                  Reset password
                </Button>
              </Grid>
              <Grid container item>
                <div className="">
                  Don't have an account?
                  <Link to="/register"> Register </Link>
                  now.
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
export default Reset;
