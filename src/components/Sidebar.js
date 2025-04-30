// Sidebar.js
import React from "react";
import { List, ListItem, ListItemText, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./LanguageContext";

const Sidebar = ({width, navbarHeight}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLanguage();

  // Handler to navigate to specific tabs
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div
      style={{
        width: width,
        backgroundColor: `${alpha(theme.palette.secondary.main, 0.5)}`,
        padding: "16px",
        boxShadow: "none",
        height: "100vh",
        position: "fixed"
      }}
    >
      <List
        sx={{
          backgroundColor: theme.palette.background.default,
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          padding: 0,
        }}
      >
        <ListItem
          onClick={() => handleNavigation("/")}
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.secondary,
            },
            transition: "all 0.3s ease",
            color: theme.palette.text.primary,
            padding: "16px",
            cursor: "pointer",
          }}
        >
          <ListItemText
            primary={"🏠 " + t.routes.Home}
            sx={{
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => handleNavigation("/binary")}
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.secondary,
            },
            transition: "all 0.3s ease",
            color: theme.palette.text.primary,
            padding: "16px",
            cursor: "pointer",
          }}
        >
          <ListItemText
            primary={"🌲 " + t.routes["Binary Menu"]}
            sx={{
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => handleNavigation("/graph")}
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.secondary,
            },
            transition: "all 0.3s ease",
            color: theme.palette.text.primary,
            padding: "16px",
            cursor: "pointer",
          }}
        >
          <ListItemText
            primary={"📊 " + t.routes["Graph Menu"]}
            sx={{
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => handleNavigation("/myData")}
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.secondary,
            },
            transition: "all 0.3s ease",
            color: theme.palette.text.primary,
            padding: "16px",
            cursor: "pointer",
          }}
        >
          <ListItemText
            primary={"🗂️ " + t.routes["My Data"]}
            sx={{
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </ListItem>
        <ListItem
          onClick={() => handleNavigation("/about")}
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.secondary.main,
              color: theme.palette.text.secondary,
            },
            transition: "all 0.3s ease",
            color: theme.palette.text.primary,
            padding: "16px",
            cursor: "pointer",
          }}
        >
          <ListItemText
            primary={"🤖 " + t.routes.About}
            sx={{
              color: "inherit",
              fontWeight: "bold",
            }}
          />
        </ListItem>
      </List>
    </div>
  );
};

export default Sidebar;
