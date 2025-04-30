import React, { useState, useEffect } from "react";
import { Button, Fade } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show the button when scrolling down
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Clean up the event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top functionality
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Fade in={showButton}>
      <Button
        onClick={scrollToTop}
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          minWidth: "0px",
          height: "50px",
          borderRadius: "50%",          
        }}
      >
        <KeyboardArrowUpIcon />
      </Button>
    </Fade>
  );
};

export default ScrollToTopButton;
