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

function BinaryMenu({ sidebarWidth }) {
  const { t } = useLanguage(); // Access the dictionary
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    // Refresh AOS after accordion opens
    setTimeout(() => AOS.refresh(), 0); // slight delay for smoothness
  };

  // Navigate to relevant pages (or actions)
  const handleInsertionClick = () => navigate("/insert-node");
  const handleDeletionClick = () => navigate("/delete-node");
  const handleSearchClick = () => navigate("/search-node");
  const handlePreOrderClick = () => navigate("/pre-order");
  const handleInOrderClick = () => navigate("/in-order");
  const handlePostOrderClick = () => navigate("/post-order");

  return (
    <Box sx={{ display: "flex" }}>
      <Box
        sx={{
          flex: 1,
          padding: "20px",
          marginLeft: sidebarWidth,
        }}
      >
        <Typography variant="h4" gutterBottom data-aos="zoom-in">
          {t.binaryMenu.title} 
        </Typography>

        {/* Beszúrás, Törlés, Keresés Accordion */}
        <Accordion
          expanded={expanded === "operations"}
          onChange={handleAccordionChange("operations")}
          data-aos="zoom-in"
          data-aos-delay="200"
          sx={{marginBottom: "10px"}}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">{t.binaryMenu.operations.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem
                onClick={handleInsertionClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.operations.insert} />
              </ListItem>
              <ListItem
                onClick={handleDeletionClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.operations.delete} />
              </ListItem>
              <ListItem
                onClick={handleSearchClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.operations.search} />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Bejárások Accordion */}
        <Accordion
          expanded={expanded === "traversals"}
          onChange={handleAccordionChange("traversals")}
          data-aos="zoom-in"
          data-aos-delay="400"
        >
          <AccordionSummary expandIcon={<ExpandMore />}
          >
            <Typography variant="h6">{t.binaryMenu.traversals.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem
                onClick={handlePreOrderClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.traversals.preOrder} />
              </ListItem>
              <ListItem
                onClick={handleInOrderClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.traversals.inOrder} />
              </ListItem>
              <ListItem
                onClick={handlePostOrderClick}
                sx={{ cursor: "pointer" }}
              >
                <ListItemText primary={t.binaryMenu.traversals.postOrder} />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
}

export default BinaryMenu;
