import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";
import { useAuth } from "../components/AuthContext";
import { useLanguage } from "../components/LanguageContext"; // Import the language context

const NewBinaryTree = ({ sidebarWidth }) => {
  const { t } = useLanguage(); // Access the dictionary
  const [treeName, setTreeName] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [nodeInput, setNodeInput] = useState("");
  const [edgeInput, setEdgeInput] = useState({ parent: "", child: "" });
  const [rootNode, setRootNode] = useState(""); // New state to hold the selected root node
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();

  const reorganizeTree = (rootId) => {
    const rootNode = nodes.find((node) => node.id === rootId);
    if (!rootNode) {
      setError(t.newBinary.errors.invalidRoot);
      return;
    }

    const newEdges = [];
    const nodeMap = {};

    nodes.forEach((node) => {
      nodeMap[node.id] = {
        id: node.id,
        label: node.label,
        parentId: null,
        leftChildId: null,
        rightChildId: null,
      };
    });

    const insertNode = (parent, child) => {
      if (Number(child.id) < Number(parent.id)) {
        if (!parent.leftChildId) {
          parent.leftChildId = child.id;
          newEdges.push({ parent: parent.id, child: child.id });
        } else {
          insertNode(nodeMap[parent.leftChildId], child);
        }
      } else if (Number(child.id) > Number(parent.id)) {
        if (!parent.rightChildId) {
          parent.rightChildId = child.id;
          newEdges.push({ parent: parent.id, child: child.id });
        } else {
          insertNode(nodeMap[parent.rightChildId], child);
        }
      }
    };

    // Rebuild the tree from the new root
    nodes.forEach((node) => {
      if (node.id !== rootNode.id) {
        insertNode(rootNode, nodeMap[node.id]);
      }
    });

    // Update edges to reflect BST rules
    setEdges(newEdges);
  };

  const handleRootNodeChange = (event) => {
    const newRootNode = event.target.value;
    setRootNode(newRootNode);

    // Reorganize the tree to enforce BST rules
    reorganizeTree(newRootNode);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!treeName) {
      setError(t.newBinary.errors.nameRequired);
      setSuccess("");
      return;
    } else {
      setError("");
    }

    if (nodes.length === 0) {
      setError(t.newBinary.errors.noNodes);
      setSuccess("");
      return;
    } else {
      setError("");
    }

    if (!rootNode) {
      setError(t.newBinary.errors.rootNodeRequired);
      setSuccess("");
      return;
    } else {
      setError("");
    }

    const nodeMap = {};
    nodes.forEach((node) => {
      nodeMap[node.id] = {
        id: node.id,
        label: node.label,
        parentId: null,
        leftChildId: null,
        rightChildId: null,
      };
    });

    // Build parent-child relationships
    const childrenCount = {};
    edges.forEach(({ parent, child }) => {
      if (!nodeMap[parent] || !nodeMap[child]) return;

      nodeMap[child].parentId = parent;
      childrenCount[parent] = (childrenCount[parent] || 0) + 1;

      if (childrenCount[parent] === 1) {
        nodeMap[parent].leftChildId = child;
      } else if (childrenCount[parent] === 2) {
        nodeMap[parent].rightChildId = child;
      } else {
        console.warn(t.newBinary.errors.tooManyChildren.replace("{parent}", parent));
      }
    });

    const formattedNodes = Object.values(nodeMap);

    const payload = {
      name: treeName,
      nodes: formattedNodes,
      root_node: rootNode, // Include the selected root node in the payload
      user_id: user.id,
    };

    try {
      const response = await fetch("http://localhost:5000/add-binary-tree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(t.newBinary.success);
        setTreeName("");
        setNodes([]);
        setEdges([]);
        setNodeInput("");
        setEdgeInput({ parent: "", child: "" });
        setRootNode(""); // Reset root node after submission
      } else {
        const error = await response.json();
        setError(`${t.newBinary.errors.serverError}: ${error.error}`);
      }
    } catch (err) {
      setError(t.newBinary.errors.serverError);
      console.error(err);
    }
  };

  const handleAddNode = () => {
    if (!nodeInput) {
      setError(t.newBinary.errors.nodeEmpty);
      return;
    } else {
      setError("");
    }
    setNodes([...nodes, { id: nodeInput, label: nodeInput }]);
    setNodeInput("");
  };

  return (
    <Box sx={{ padding: "24px", maxWidth: "600px", marginLeft: sidebarWidth }}>
      <Paper sx={{ padding: "16px", borderRadius: "8px", boxShadow: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
          {t.newBinary.title}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label={t.newBinary.labels.name}
            variant="outlined"
            fullWidth
            sx={{ mb: 3 }}
            value={treeName}
            onChange={(e) => setTreeName(e.target.value)}
          />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t.newBinary.labels.nodes}
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
            label={t.newBinary.labels.nodeId}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            value={nodeInput}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              setNodeInput(value);
            }}
          />
          <Button variant="contained" onClick={handleAddNode} fullWidth>
            {t.newBinary.labels.addNode}
          </Button>

          {/* Root Node Dropdown */}
          <FormControl fullWidth sx={{ mt: 3, mb: 3 }}>
            <InputLabel id="root-node-label">{t.newBinary.labels.rootNode}</InputLabel>
            <Select
              labelId="root-node-label"
              value={rootNode}
              label={t.newBinary.labels.rootNode}
              onChange={handleRootNodeChange}
            >
              {nodes.map((node, index) => (
                <MenuItem key={index} value={node.id}>
                  {node.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {rootNode && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                {t.newBinary.labels.parentChildRelations}
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
                      {edge.parent} → {edge.child}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {/* Error and Success Messages */}
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

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 4 }}>
            {t.newBinary.labels.submit}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default NewBinaryTree;