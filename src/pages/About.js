import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Box, Typography, Paper, Divider } from "@mui/material";
import { useLanguage } from "../components/LanguageContext";

const About = ({ sidebarWidth }) => {
  const { t } = useLanguage(); // Access the dictionary

  useEffect(() => {
    AOS.init({ duration: 750, once: true });
  }, []);

  // Helper function to render HTML safely
  const renderHTML = (htmlString) => {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
  };

  return (
    <Box
      sx={{
        padding: "32px",
        marginLeft: sidebarWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowX: "hidden",
        overflowY: "hidden",
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1976d2" }}
        data-aos="zoom-in"
      >
        🤖 {t.about.title}
      </Typography>

      {/* Content */}
      <Paper
        elevation={3}
        sx={{
          maxWidth: "800px",
          width: "100%",
          padding: "24px",
          backgroundColor: "#f5faff",
          borderRadius: "12px",
        }}
        data-aos="zoom-in"
        data-aos-delay="200"
      >
        {/* Overview Section */}
        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          🧠 {t.about.overview.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {renderHTML(t.about.overview.description)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Features Section */}
        <Typography variant="h5" gutterBottom>
          🚀 {t.about.features.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {t.about.features.list.map((feature, index) => (
            <span key={index}>
              {renderHTML(`• ${feature}`)}
              <br />
            </span>
          ))}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* My Data Section */}
        <Typography variant="h5" gutterBottom>
          📁 {t.about.myData.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {renderHTML(t.about.myData.description)}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Vision Section */}
        <Typography variant="h5" gutterBottom>
          🌟 {t.about.vision.title}
        </Typography>
        <Typography variant="body1" gutterBottom>
          {renderHTML(t.about.vision.description)}
        </Typography>

        <Typography
          variant="body2"
          sx={{ mt: 3, fontStyle: "italic", color: "#555" }}
        >
          {renderHTML(t.about.vision.footer)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default About;