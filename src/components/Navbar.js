import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Autocomplete, TextField, Select, MenuItem, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Icon for Profile
import { useAuth } from "./AuthContext"; // Import authentication context
import routes from "../routes.json"; // Import routes JSON
import { useLanguage } from "./LanguageContext";

function Navbar({ height }) {
  const { isAuthenticated, logout } = useAuth(); // Access auth state & logout function
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate(); // To programmatically navigate
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const theme = useTheme();

  const visibleRoutes = routes.filter((route) => !route.protected || isAuthenticated);

  const translatedRoutes = visibleRoutes.map((route) => ({
    ...route,
    name: t.routes[route.name],
  }));

  const searchOptions = searchQuery
    ? translatedRoutes.map((route) => route.name)
    : [];

  return (
    <AppBar
      position="fixed"
      style={{
        height: height,
      }}
    >
      <Toolbar>
        {/* Logo or brand title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
          }}
        >
          <Link
            to="/"
            style={{
              color: "inherit", // Use theme's text color
              textDecoration: "none",
            }}
          >
            {t.brand}
          </Link>
        </Typography>

        {/* MUI Autocomplete Search */}
        <Box sx={{ marginRight: 2, width: 300 }}>
          <Autocomplete
            freeSolo
            getOptionLabel={(option) => option || ""}
            options={searchOptions} // Dynamically update options based on searchQuery
            inputValue={searchQuery}
            onInputChange={(event, newInputValue) => setSearchQuery(newInputValue)} // Handle typing
            onChange={(event, selectedOption) => {
              const selectedRoute = translatedRoutes.find((route) => route.name === selectedOption);
              if (selectedRoute) {
                navigate(selectedRoute.path); // Navigate to the selected route
              }
              setSearchQuery(""); // Clear search after navigation
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={t.searchPlaceholder}
                size="small"
                variant="outlined"
                sx={{
                  backgroundColor: theme.palette.background.default, // Set background color
                  borderRadius: 1, // Optional: Add rounded corners
                }}
              />
            )}
          />
        </Box>

        {/* Language Dropdown */}
        <Select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          variant="standard" // Minimalist dropdown with underline
          sx={{
            marginRight: 2,
            color: "inherit",
            "&:before": {
              borderBottom: "1px solid white", // Thin white underline when inactive
            },
            "&:after": {
              borderBottom: "2px solid white", // Thicker white underline when focused
            },
            "& .MuiSelect-icon": {
              color: "inherit", // Dropdown arrow icon in white
            },
            borderRadius: 0, // Optional: Add subtle rounding
          }}
        >
          <MenuItem value="English">{t.languages.english}</MenuItem>
          <MenuItem value="Hungarian">{t.languages.hungarian}</MenuItem>
        </Select>

        {/* Authentication buttons */}
        {!isAuthenticated ? (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              startIcon={<LoginIcon />}
            >
              {t.login.title}
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/register"
              startIcon={<AppRegistrationIcon />}
            >
              {t.register.title}
            </Button>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              component={Link}
              to="/profile" // Navigate to the profile page
              startIcon={<AccountCircleIcon />}
            >
              {t.profile.title}
            </Button>
            <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
              {t.logout}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;