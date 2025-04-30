import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthContext";
import {
  Button,
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "../components/LanguageContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home({ sidebarWidth }) {
  const { user, logout } = useAuth(); // Az aktuális felhasználó és kijelentkezés funkció
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(user); // Lokális állapot a felhasználói adatokhoz

  useEffect(() => {
    AOS.init({ duration: 1200, once: true });

    // Felhasználói adatok lekérése a backendről
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          const response = await axios.get(`http://localhost:5000/get-profile/${user.id}`);
          setCurrentUser(response.data); // Frissítjük a lokális állapotot a backendről kapott adatokkal
        }
      } catch (error) {
        console.error("Hiba a felhasználói adatok lekérésekor:", error);
      }
    };

    fetchUserData(); // Meghívjuk a lekérési függvényt
  }, [user]);

  return (
    <Box sx={{ display: "flex", marginLeft: sidebarWidth, padding: "24px" }}>
      <Container maxWidth="lg">
        {/* Üdvözlő szekció */}
        <Box sx={{ textAlign: "center", mb: 4 }} data-aos="fade-down">
          <Typography variant="h3" gutterBottom>
            {t.home.welcome}{currentUser?.name ? `, ${currentUser.name}` : ""}! 🎉
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {t.home.tagline}
          </Typography>
        </Box>

        {/* How it works */}
        <Box sx={{ mb: 5 }} data-aos="fade-up">
          <Typography variant="h4" gutterBottom>
            {t.home.howItWorks}
          </Typography>
          <Typography variant="body1">
            {t.home.description}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            - {t.home.points["1"]}
            <br />
            - {t.home.points["2"]}
            <br />
            - {t.home.points["3"]}
          </Typography>
        </Box>

        {/* Features */}
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={4} data-aos="fade-up">
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t.home.features.viewGraphs.title}
                </Typography>
                <Typography variant="body2">
                  {t.home.features.viewGraphs.desc}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate("/myData")}
                >
                  {t.home.features.viewGraphs.btn}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} data-aos="fade-up" data-aos-delay="200">
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t.home.features.binaryAlgorithms.title}
                </Typography>
                <Typography variant="body2">
                  {t.home.features.binaryAlgorithms.desc}
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" fullWidth onClick={() => navigate("/binary")}>
                  {t.home.features.binaryAlgorithms.btn}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4} data-aos="fade-up" data-aos-delay="400">
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {t.home.features.graphAlgorithms.title}
                </Typography>
                <Typography variant="body2">
                  {t.home.features.graphAlgorithms.desc}
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" fullWidth onClick={() => navigate("/graph")}>
                  {t.home.features.graphAlgorithms.btn}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Why Choose Section */}
        <Box mt={6} data-aos="zoom-in">
          <Paper elevation={2} sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              {t.home.why.title}
            </Typography>
            <Typography variant="body1">
              {t.home.why.desc}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 2 }}
              onClick={() => navigate("/about")}
            >
              {t.home.why.btn}
            </Button>
          </Paper>
        </Box>

        {/* Logout Section */}
        <Grid item xs={12} mt={5} data-aos="zoom-in">
          <Paper sx={{ padding: 2, textAlign: "center" }}>
            {user ? (
              <>
                <Typography variant="body1">{t.home.logoutPrompt.text}</Typography>
                <Button variant="contained" color="error" onClick={logout} sx={{ mt: 1 }}>
                  {t.home.logoutPrompt.btn}
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1">{t.home.loginPrompt.text}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/login")}
                  sx={{ mt: 1 }}
                >
                  {t.home.loginPrompt.btn}
                </Button>
              </>
            )}
          </Paper>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;