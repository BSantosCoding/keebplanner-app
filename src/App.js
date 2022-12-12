import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Account from "./components/Account/Account";
import Reset from "./components/Reset/Reset";
import Dashboard from "./components/Dashboard/Dashboard";
import { createTheme, CssBaseline, Grid, ThemeProvider } from "@mui/material";
import { orange } from "@mui/material/colors";
import { useState, useEffect, useContext } from "react";
import { ref, onValue } from "@firebase/database";
import { db } from "./Firebase/firebase";
import { AuthContext } from "./context/Context";

function App() {
  const [darkMode, setDarkMode] = useState("dark");
  const { user } = useContext(AuthContext);

  useEffect(() => {
    onValue(ref(db, "userpreferences/" + user?.uid), (snapshot) => {
      if (snapshot.exists()) {
        if (snapshot.val().darkMode) setDarkMode("dark");
        else setDarkMode("light");
      }
    });
  }, [user]);

  const appTheme = createTheme({
    palette: {
      mode: darkMode,
      primary: {
        main: orange[500],
      },
    },
  });

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Router>
          <Grid
            item
            xs={12}
            sx={{ height: "100vh" }}
            alignItems="center"
            justifyContent="center"
          >
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route path="/reset" element={<Reset />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Grid>
        </Router>
      </Grid>
    </ThemeProvider>
  );
}
export default App;
