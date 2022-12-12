import React, { useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { AuthContext } from "./../../context/Context";
import {
  Grid,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs,
  MenuItem,
  Menu,
  Typography,
  Button,
} from "@mui/material";
import { sendEmailVerification } from "@firebase/auth";
import Parts from "../Parts/Parts";
import Sales from "../Sales/Sales";
import Purchases from "../Purchases/Purchases";
import Builds from "../Builds/Builds";
import Interests from "../Interests/Interests";
import Account from "../Account/Account";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { logout } from "./../../Firebase/firebase";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const history = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const open = Boolean(anchorElNav);

  const [tabHeight, setTabHeight] = useState(0);

  const [menuOption, setMenuOption] = useState("");

  useEffect(() => {
    setTabHeight(document.getElementById("tab").clientHeight);
  }, [tabHeight]);

  useEffect(() => {
    if (!user) return history("/", { replace: true });
    else {
      if (!user.emailVerified) sendEmailVerification(user);
    }
  }, [user, history]);

  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    if (newValue !== "Menu") setTab(newValue);
    else handleOpenNavMenu(event);
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <Grid container>
      <Grid
        container
        item
        id="tab"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab value="Menu" icon={<MenuIcon onClick={handleOpenNavMenu} />} />
          <Tab label="Purchases" value={0} />
          <Tab label="Sales" value={1} />
          <Tab label="Builds" value={2} />
          <Tab label="Parts" value={3} />
          <Tab label="Interests" value={4} />
        </Tabs>
        <Menu
          id="tab-menu"
          anchorEl={anchorElNav}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          open={open}
          onClose={handleCloseNavMenu}
        >
          {user ? (
            <MenuItem
              onClick={() => {
                logout();
                handleCloseNavMenu();
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleCloseNavMenu();
                history("/", { replace: true });
              }}
            >
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText>Login</ListItemText>
            </MenuItem>
          )}
          {user ? (
            <MenuItem
              onClick={() => {
                handleCloseNavMenu();
                setMenuOption("account");
                setTab("Menu");
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText>Account</ListItemText>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => {
                handleCloseNavMenu();
                history("/register", { replace: true });
              }}
            >
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText>Register</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Grid>
      <Grid
        container
        item
        sx={{
          pt: 3,
          height: "calc(100vh - 11px - " + tabHeight + "px)",
        }}
      >
        {user && [
          !user.emailVerified && (
            <Grid
              container
              spacing={2}
              direction="column"
              justifyContent="center"
              alignItems="center"
              sx={{
                height: "100%",
                width: "100%",
              }}
            >
              <Grid item>
                <Typography variant="h5">
                  To be able to use the application check your email.
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  Click the link in the email to verify your account!
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    sendEmailVerification(user);
                  }}
                >
                  Resend Verification
                </Button>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  After verifying your email, refresh the page.
                </Typography>
              </Grid>
            </Grid>
          ),
          user.emailVerified && tab === "Menu" && menuOption === "account" && (
            <Account />
          ),
          user.emailVerified && tab === 0 && <Purchases />,
          user.emailVerified && tab === 1 && <Sales />,
          user.emailVerified && tab === 2 && <Builds />,
          user.emailVerified && tab === 3 && <Parts />,
          user.emailVerified && tab === 4 && <Interests />,
        ]}
      </Grid>
    </Grid>
  );
}
export default Dashboard;
