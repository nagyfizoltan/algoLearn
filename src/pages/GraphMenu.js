import React, { useEffect, useState } from "react";
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "../components/LanguageContext"; // Import the language context

function GraphMenu({ sidebarWidth }) {
  const { t } = useLanguage(); // Access the dictionary
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState("search"); // Set "search" as the default expanded accordion

  useEffect(() => {
    AOS.init({
      duration: 750,
      once: true,
      offset: 0, // Prevents extra spacing for animations
    });
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    // Refresh AOS after accordion opens
    setTimeout(() => AOS.refresh(), 0); // Slight delay for smoothness
  };

  const handleBFSClick = () => navigate("/bfs");
  const handleDFSClick = () => navigate("/dfs");

  return (
    <Box
      sx={{
        display: "flex",
        overflow: "hidden", // Ensure no overflow during animations
      }}
    >
      <Box
        sx={{
          flex: 1,
          padding: "20px",
          marginLeft: sidebarWidth,
          minWidth: 0, // Prevent content from exceeding parent container width
        }}
      >
        <Typography
          variant="h4"
          sx={{ marginBottom: "20px" }}
          data-aos="zoom-in"
        >
          {t.graphMenu.title}
        </Typography>

        {/* Search Algorithms Accordion */}
        <Accordion
          expanded={expanded === "search"}
          onChange={handleAccordionChange("search")}
          sx={{ marginBottom: "10px" }}
          data-aos="zoom-in"
          data-aos-delay="200"
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">{t.graphMenu.search.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem onClick={handleBFSClick} sx={{ cursor: "pointer" }}>
                <ListItemText primary={t.graphMenu.search.bfs} />
              </ListItem>
              <ListItem onClick={handleDFSClick} sx={{ cursor: "pointer" }}>
                <ListItemText primary={t.graphMenu.search.dfs} />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}

export default GraphMenu;