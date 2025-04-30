import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useAuth } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext"; // Import the language context

const NewGraph = ({ sidebarWidth }) => {
  const { t } = useLanguage(); // Access the dictionary
  const [graphName, setGraphName] = useState("");
  const [isDirected, setIsDirected] = useState(true);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeInput, setNodeInput] = useState("");
  const [edgeInput, setEdgeInput] = useState({ source: "", target: "" });
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if the graph name and at least one node are provided
    if (!graphName) {
      setError(t.newGraph.errors.nameRequired);
      return;
    } else {
      setError("");
    }
    if (nodes.length === 0) {
      setError(t.newGraph.errors.nodeRequired);
      return;
    } else {
      setError("");
    }

    const payload = {
      name: graphName,
      is_directed: isDirected ? 1 : 0,
      nodes,
      edges,
      user_id: user.id,
    };

    try {
      const response = await fetch("http://localhost:5000/add-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(t.newGraph.success);
        setGraphName("");
        setIsDirected(true);
        setNodes([]);
        setEdges([]);
        setNodeInput("");
        setEdgeInput({ source: "", target: "" });
      } else {
        const error = await response.json();
        setError(`${t.newGraph.errors.serverError}: ${error.error}`);
      }
    } catch (err) {
      setError(t.newGraph.errors.serverError);
      console.error(err);
    }
  };

  const handleAddNode = () => {
    if (!nodeInput) return;
    setNodes([...nodes, { id: nodeInput, label: nodeInput }]);
    setNodeInput("");
  };

  const handleAddEdge = () => {
    if (!edgeInput.source || !edgeInput.target) return;
    setEdges([...edges, { source: edgeInput.source, target: edgeInput.target }]);
    setEdgeInput({ source: "", target: "" });
  };

  return (
    <Box sx={{ padding: "24px", maxWidth: "600px", marginLeft: sidebarWidth }}>
      <Paper sx={{ padding: "16px", borderRadius: "8px", boxShadow: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          {t.newGraph.title}
        </Typography>
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <TextField
            label={t.newGraph.labels.name}
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={graphName}
            onChange={(e) => setGraphName(e.target.value)}
          />
          <Grid container alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              {t.newGraph.labels.isDirected}
            </Typography>
            <Button
              variant={isDirected ? "contained" : "outlined"}
              onClick={() => setIsDirected(true)}
              sx={{ marginRight: 1 }}
            >
              {t.newGraph.labels.yes}
            </Button>
            <Button
              variant={!isDirected ? "contained" : "outlined"}
              onClick={() => setIsDirected(false)}
            >
              {t.newGraph.labels.no}
            </Button>
          </Grid>

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t.newGraph.labels.nodes}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {nodes.map((node, index) => (
              <Grid item key={index}>
                <Typography
                  variant="body1"
                  sx={{
                    padding: "4px 8px",
                    border: "1px solid #90caf9",
                    borderRadius: "8px",
                  }}
                >
                  {node.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
          <TextField
            label={t.newGraph.labels.nodeId}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={nodeInput}
            onChange={(e) => setNodeInput(e.target.value)}
          />
          <Button variant="contained" onClick={handleAddNode} fullWidth>
            {t.newGraph.labels.addNode}
          </Button>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            {t.newGraph.labels.edges}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {edges.map((edge, index) => (
              <Grid item key={index}>
                <Typography
                  variant="body1"
                  sx={{
                    padding: "4px 8px",
                    border: "1px solid #90caf9",
                    borderRadius: "8px",
                  }}
                >
                  {edge.source} {isDirected ? "→" : "—"} {edge.target}
                </Typography>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="source-node-label">{t.newGraph.labels.source}</InputLabel>
                <Select
                  labelId="source-node-label"
                  label={t.newGraph.labels.source}
                  value={edgeInput.source}
                  onChange={(e) =>
                    setEdgeInput({ ...edgeInput, source: e.target.value })
                  }
                >
                  {nodes.map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      {node.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="target-node-label">{t.newGraph.labels.target}</InputLabel>
                <Select
                  labelId="target-node-label"
                  label={t.newGraph.labels.target}
                  value={edgeInput.target}
                  onChange={(e) =>
                    setEdgeInput({ ...edgeInput, target: e.target.value })
                  }
                >
                  {nodes.map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      {node.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Button variant="contained" onClick={handleAddEdge} fullWidth>
            {t.newGraph.labels.addEdge}
          </Button>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 4 }}
          >
            {t.newGraph.labels.submit}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewGraph;