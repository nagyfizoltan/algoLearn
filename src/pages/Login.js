import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, Box, Grid, Paper, Alert } from "@mui/material";
import { LockOpen } from "@mui/icons-material";
import { useAuth } from "../components/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "../components/LanguageContext";

function Login({ sidebarWidth }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const { t } = useLanguage(); // Using the translation context for Hungarian text

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const validateEmail = (email) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = () => {
    setError("");
    setSuccess("");
    setEmailError("");
    setPasswordError("");

    let valid = true;

    if (!email) {
      setEmailError(t.error.emailRequired);
      valid = false;
    } else if (!validateEmail(email)) {
      setEmailError(t.error.emailInvalid);
      valid = false;
    }

    if (!password) {
      setPasswordError(t.error.passwordRequired);
      valid = false;
    }

    if (!valid) {
      return; // Ha nem valid, itt megállunk, nem küldünk requestet
    }

    axios
      .post("http://localhost:5000/login", { email, password })
      .then((response) => {
        setSuccess(t.login.success);
        const userData = response.data.user;
        localStorage.setItem("user", JSON.stringify(userData));
        login(userData);
        setEmail("");
        setPassword("");
        navigate("/");
      })
      .catch((error) => {
        setError(t.error.login);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        padding: "16px",
        marginLeft: sidebarWidth,
      }}
    >
      <Paper
        elevation={3}
        style={{ padding: "20px", width: "100%", maxWidth: "600px" }}
        data-aos="fade-up"
      >
        <Typography variant="h4" align="center" gutterBottom>
          {t.login.title}
        </Typography>

        <Grid container spacing={2} data-aos="fade-in">
          <Grid item xs={12}>
            <TextField
              label={t.login.email}
              variant="filled"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.login.password}
              variant="filled"
              fullWidth
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
          {success && (
            <Grid item xs={12}>
              <Alert severity="success">{success}</Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              startIcon={<LockOpen />}
            >
              {t.login.title}
            </Button>
          </Grid>

          <Grid item xs={12} style={{ textAlign: "center" }}>
            <Typography variant="body2">
              {t.login.notUser}{" "}
              <Button
                variant="text"
                color="secondary"
                onClick={() => navigate("/register")}
              >
                {t.login.registerHere}
              </Button>
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Login;
