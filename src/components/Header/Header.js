import React, { useContext, useState } from "react";
import { logout } from "./../../Firebase/firebase";
import { AuthContext } from "./../../context/Context";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";

function Header() {
  const { user } = useContext(AuthContext);
  const history = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const pages = [];

  return (
    <AppBar id="header">
      <Toolbar disableGutters>
        <Grid container justifyContent={"space-between"}>
          <Grid
            item
            style={{ display: "flex" }}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ ml: 2, mr: 2, display: { xs: "none", md: "flex" } }}
              onClick={() => {
                history("/", { replace: true });
              }}
            >
              KeebPlanner
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
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
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page[0]} onClick={handleCloseNavMenu}>
                    <Typography
                      textAlign="center"
                      onClick={() => {
                        history(page[2], { replace: true });
                      }}
                    >
                      {page[0]}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
            >
              KeebPlanner
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <IconButton
                  key={page}
                  size="large"
                  onClick={() => {
                    history(page[2], { replace: true });
                  }}
                  color="inherit"
                >
                  {page[1]}
                </IconButton>
              ))}
            </Box>
          </Grid>
          <Grid
            item
            style={{ display: "flex" }}
            justifyContent="center"
            alignItems="center"
          >
            <Box sx={{ flexGrow: 0, mr: 2 }}>
              {user ? (
                <IconButton
                  size="large"
                  onClick={() => {
                    history("/", { replace: true });
                    logout();
                  }}
                  color="inherit"
                >
                  <LogoutIcon />
                </IconButton>
              ) : (
                <IconButton
                  size="large"
                  onClick={() => {
                    history("/", { replace: true });
                  }}
                  color="inherit"
                >
                  <LoginIcon />
                </IconButton>
              )}
              {user ? (
                <IconButton
                  size="large"
                  onClick={() => {
                    history("/account", { replace: true });
                  }}
                  color="inherit"
                >
                  <AccountCircleIcon />
                </IconButton>
              ) : (
                <IconButton
                  size="large"
                  onClick={() => {
                    history("/register", { replace: true });
                  }}
                  color="inherit"
                >
                  <AccountCircleIcon />
                </IconButton>
              )}
            </Box>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
