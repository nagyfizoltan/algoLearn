import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, Grid, Paper, Alert } from "@mui/material";
import { AddCircle } from "@mui/icons-material";
import AOS from "aos";
import "aos/dist/aos.css";
import { useLanguage } from "../components/LanguageContext"; // Importáljuk a useLanguage-t

function Register({ sidebarWidth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added confirmPassword state

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // Added confirmPasswordError state

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { t } = useLanguage(); // Használjuk a useLanguage-t

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    // A jelszó erősség ellenőrzése (legalább 6 karakter, kis- és nagybetűk, számok és speciális karakterek)
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const addUser = () => {
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError(""); // Reset the confirmPasswordError
    setSuccess("");
    setError("");

    let isValid = true;

    if (!name.trim()) {
      setNameError(t.error.nameRequired);
      isValid = false;
    }

    if (!validateEmail(email)) {
      setEmailError(t.error.emailInvalid);
      isValid = false;
    }

    if (!validatePassword(password)) {
      setPasswordError(t.error.passwordWeak);
      isValid = false;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setConfirmPasswordError(t.error.passwordMismatch); // Custom error for mismatched passwords
      isValid = false;
    }

    if (!isValid) return;

    axios
      .post("http://localhost:5000/register", { name, email, password })
      .then(() => {
        setSuccess(t.register.success);
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword(""); // Reset confirmPassword
      })
      .catch(() => {
        setError(t.error.register);
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
      data-aos="fade-up"
    >
      <Paper elevation={3} style={{ padding: "20px", width: "100%", maxWidth: "600px" }}>
        <Typography variant="h4" align="center" gutterBottom>
          {t.register.title}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={t.register.name}
              variant="outlined"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={!!nameError}
              helperText={nameError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.register.email}
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.register.password}
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.register.passwordAgain} // Label set to "Password Again"
              type="password"
              variant="outlined"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
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
              onClick={addUser}
              startIcon={<AddCircle />}
            >
              {t.register.title}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default Register;
