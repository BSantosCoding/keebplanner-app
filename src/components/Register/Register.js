import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useContext(AuthContext);
  const history = useNavigate();
  const register = () => {
    if (!name) alert("Please enter name");
    registerWithEmailAndPassword(name, email, password);
  };
  useEffect(() => {
    if (user) history("/dashboard", { replace: true });
  }, [user, history]);
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
                <Typography variant="h4">Sign up</Typography>
              </Grid>
              <Grid container item>
                <TextField
                  sx={{ width: "100%" }}
                  label="Name"
                  id="typeText"
                  variant="standard"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />{" "}
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
              <Grid container item>
                <FormControl sx={{ width: "100%" }} variant="standard">
                  <InputLabel htmlFor="standard-adornment-password">
                    Password
                  </InputLabel>
                  <Input
                    id="standard-adornment-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            setShowPassword(!showPassword);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid
                container
                item
                spacing={2}
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <Button variant="contained" onClick={register}>
                    Register
                  </Button>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={signInWithGoogle}>
                    <GoogleIcon />
                  </Button>
                </Grid>
              </Grid>
              <Grid container item>
                <div className="">
                  Already have an account?
                  <Link to="/"> Login </Link>
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
export default Register;
