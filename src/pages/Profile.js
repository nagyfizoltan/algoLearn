import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Typography, Box, Grid, Paper, Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Save, Delete } from "@mui/icons-material";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAuth } from "../components/AuthContext"; // Import authentication context
import { useLanguage } from "../components/LanguageContext";

function Profile({ sidebarWidth }) {
  const { user, logout } = useAuth(); // Access current user and logout function
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentName, setCurrentName] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");

  const [success, setSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { t } = useLanguage();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  
    if (user && user.id) {
      // Fetch user profile data using the current user's ID
      axios
        .get(`http://localhost:5000/get-profile/${user.id}`) // Include user ID in the URL
        .then((response) => {
          const { name, email } = response.data;
          setName(name);
          setEmail(email);
          setCurrentName(name); // Store initial name
          setCurrentEmail(email); // Store initial email
        })
        .catch(() => {
          setError(t.error.fetchProfile);
        });
    }
  }, [user, t]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return regex.test(password);
  };

  const updateProfile = () => {
    setNameError("");
    setEmailError("");
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
  
    if (!isValid) return;
  
    const updatePromises = [];
  
    // Only call update-username if the name has changed
    if (name !== currentName) {
      updatePromises.push(
        axios.put("http://localhost:5000/update-username", { userId: user.id, newName: name })
      );
    }
  
    // Only call update-email if the email has changed
    if (email !== currentEmail) {
      updatePromises.push(
        axios.put("http://localhost:5000/update-email", { userId: user.id, newEmail: email })
      );
    }
  
    if (updatePromises.length === 0) {
      setSuccess(t.profile.noChanges); // Show a message if no changes were made
      return;
    }
  
    Promise.all(updatePromises)
      .then(() => {
        setSuccess(t.profile.updateSuccess); // Show success message
        setCurrentName(name); // Update current name
        setCurrentEmail(email);
      })
      .catch(() => {
        setError(t.error.updateProfile); // Show error message
      });
  };

  const changePassword = () => {
    setPasswordError("");
    setConfirmPasswordError("");
  
    if (!validatePassword(newPassword)) {
      setPasswordError(t.error.passwordWeak);
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t.error.passwordMismatch);
      return;
    }
  
    axios
      .put("http://localhost:5000/update-password", {
        userId: user.id, // Include userId
        oldPassword,
        newPassword,
      })
      .then(() => {
        setPasswordSuccess(t.profile.passwordChangeSuccess);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPasswordError("");
      })
      .catch((err) => {
        console.error("Error updating password:", err.response?.data || err.message);
        // setError(t.error.passwordChange);
        setCurrentPasswordError(t.error.passwordChange); // Set specific error
      });
  };

  const deleteAccount = () => {
    setDeletePasswordError(""); 

    axios
      .delete("http://localhost:5000/delete-profile", {
        data: { userId: user.id, password: oldPassword }, // Include userId and password
      })
      .then(() => {
        setSuccess(t.profile.deleteSuccess);
        setDeleteDialogOpen(false);
        logout(); // Log out the user after account deletion
      })
      .catch((err) => {
        console.error("Error deleting account:", err.response?.data || err.message);
        setError(t.error.deleteAccount);
        setDeletePasswordError(t.error.passwordChange); // Set specific error for delete password
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
          {t.profile.title}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label={t.profile.name}
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
              label={t.profile.email}
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!emailError}
              helperText={emailError}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={updateProfile}
              startIcon={<Save />}
            >
              {t.profile.updateButton}
            </Button>
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
            <Typography variant="h6">{t.profile.changePassword}</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.profile.oldPassword}
              type="password"
              variant="outlined"
              fullWidth
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.profile.newPassword}
              type="password"
              variant="outlined"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={!!passwordError}
              helperText={passwordError}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label={t.profile.confirmPassword}
              type="password"
              variant="outlined"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!confirmPasswordError}
              helperText={confirmPasswordError}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={changePassword}
              startIcon={<Save />}
            >
              {t.profile.changePasswordButton}
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={() => setDeleteDialogOpen(true)}
              startIcon={<Delete />}
            >
              {t.profile.deleteAccount}
            </Button>
          </Grid>

          {currentPasswordError && (
            <Grid item xs={12}>
              <Alert severity="error">{currentPasswordError}</Alert>
            </Grid>
          )}
          {passwordSuccess && (
            <Grid item xs={12}>
              <Alert severity="success">{passwordSuccess}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t.profile.deleteConfirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t.profile.deleteConfirmMessage}</DialogContentText>
          <TextField
            label={t.profile.password}
            type="password"
            variant="outlined"
            fullWidth
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={!!deletePasswordError}
            helperText={deletePasswordError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t.profile.cancel}</Button>
          <Button onClick={deleteAccount} color="error">
            {t.profile.confirmDelete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Profile;