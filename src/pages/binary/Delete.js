import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, Slider, MenuItem } from "@mui/material";
import axios from "axios";
import * as d3 from "d3";
import { useAuth } from "../../components/AuthContext";
import { set } from "react-hook-form";

const Delete = ({ sidebarWidth }) => {
  const [treeData, setTreeData] = useState(null);
  const [binaryTrees, setBinaryTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState("");
  const [newNodeValue, setNewNodeValue] = useState("");
  const treeRef = useRef(null);
  const { user } = useAuth();
  const maxSpeed = 10;
  const minSpeed = 0;
  const [animationSpeed, setAnimationSpeed] = useState(maxSpeed / 2);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Fetch binary trees and the selected tree data
  useEffect(() => {
    const fetchBinaryTrees = async () => {
      try {
        let response = "";
        if (user) {
          response = await axios.get("http://localhost:5000/get-binary-trees?userId=" + user.id);
        } else {
          response = await axios.get("http://localhost:5000/get-binary-trees");
        }
        setBinaryTrees(response.data);
        if (response.data.length > 0) {
          const firstTreeId = response.data[0].id;
          setSelectedTreeId(firstTreeId);
          const firstTreeResponse = await axios.get(`http://localhost:5000/get-binary-tree/${firstTreeId}`);
          setTreeData(firstTreeResponse.data.elements);
        }
      } catch (error) {
        console.error("Error fetching binary trees:", error);
      }
    };

    fetchBinaryTrees();
  }, []);

  // Handle tree change
  const handleTreeChange = async (event) => {
    const selectedId = event.target.value;
    setSelectedTreeId(selectedId);
    try {
      const response = await axios.get(`http://localhost:5000/get-binary-tree/${selectedId}`);
      setTreeData(response.data.elements);
      console.log("Selected tree data:", response.data.elements);
    } catch (error) {
      console.error("Error loading tree data:", error);
    }
  };

  const waitForUnpause = () => {
    setIsRunning(false); // Set isRunning to false when paused
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isPausedRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // check every 100ms
    });
  };

  const DeleteNodeWithAnimation = async (node, value) => {
    if (!node) {
        return null; // If the node is null, there's nothing to delete
    }

    if (!node.children) {
        node.children = []; // Initialize children if missing
    }

    const highlightNode = (nodeName, color) => {
        d3.select(`[data-name="${nodeName}"] circle`)
            .transition()
            .duration(maxSpeed * 100 - animationSpeed * 75)
            .attr("fill", color);
    };

    highlightNode(node.name, "#ffeb3b");
    await new Promise((resolve) => setTimeout(resolve, maxSpeed * 100 - animationSpeed * 75)); // Animation delay

    // Traverse left
    if (Number(value) < Number(node.name)) {
        const leftChild = node.children.find((child) => Number(child?.name) < Number(node.name));
        if (leftChild) {
            const result = await DeleteNodeWithAnimation(leftChild, value);
            if (result === null) {
                node.children = node.children.filter((child) => child !== leftChild);
            }
            highlightNode(node.name, "#90caf9");
            return node;
        }
    }
    // Traverse right
    else if (Number(value) > Number(node.name)) {
        const rightChild = node.children.find((child) => Number(child?.name) >= Number(node.name));
        if (rightChild) {
            const result = await DeleteNodeWithAnimation(rightChild, value);
            if (result === null) {
                node.children = node.children.filter((child) => child !== rightChild);
            }
            highlightNode(node.name, "#90caf9");
            return node;
        }
    }
    // Node to delete found
    else {
        console.log(`Node ${value} found and deleted.`);
        highlightNode(node.name, "#f44336");
        await new Promise((resolve) => setTimeout(resolve, maxSpeed * 100 - animationSpeed * 75));

        // Case 1: No children
        if (node.children.length === 0) {
            return null;
        }
        // Case 2: One child
        else if (node.children.length === 1) {
            console.log(`Replacing node ${node.name} with its single child ${node.children[0].name}`);
            const singleChild = node.children[0]; // Get the single child
        
            // Update the parent's reference to the current node
            node.name = singleChild.name;
            node.children = singleChild.children;
        
            return node; // Return the updated node
        }
        // Case 3: Two children
        else {
            const rightChild = node.children.find((child) => Number(child?.name) >= Number(node.name));
            if (rightChild) {
                let successor = rightChild;
                let left = true
                while (successor && successor.children && left) {
                    console.log("asas")
                    let temp = successor.children.find((child) => Number(child?.name) < Number(successor.name));
                    if (temp) {
                        successor = temp;
                    } else left = false
                    console.log(successor)
                }

                if (successor) {
                    node.name = successor.name; // Replace value with successor's value
                    const result = await DeleteNodeWithAnimation(rightChild, successor.name);
                    if (result === null) {
                        node.children = node.children.filter((child) => child !== successor);
                    }
                }
                return node;
            }
        }
    }

    highlightNode(node.name, "#90caf9");
    return node;
};


  // Function to check if a value exists in the tree
  const nodeExists = (node, value) => {
    if (!node) return false;

    if (node.name === value) {
      return true; // Node already exists
    }

    // Recursively check left and right children
    for (let child of node.children) {
      if (nodeExists(child, value)) {
        return true;
      }
    }

    return false; // Node not found in the tree
  };

  const handleDeleteNodeWithAnimation = async () => {
    if (!newNodeValue) return;

    if (!nodeExists(treeData, newNodeValue)) {
      alert("Node doesn't exist in the tree!"); // Node to delete doesn't exist
      return; // Exit if the node doesn't exist
    }
    setIsRunning(true); // Animation starts here!

    const updatedTree = { ...treeData };
    await DeleteNodeWithAnimation(updatedTree, newNodeValue); // Wait for animations to complete
    setTreeData(updatedTree);
    console.log("here")
    setNewNodeValue("");
    setIsRunning(false); // Animation ends here!
  };

  // Function to handle node deletion without animation
  const DeleteNode = (node, value) => {
    if (!node) {
      return null; // Node to delete not found
    }

    if (!node.children) {
      node.children = [];
    }

    // If value is smaller, it belongs in the left subtree
    if (Number(value) < Number(node.name)) {
      const leftChild = node.children.find((child) => Number(child?.name) < Number(node.name));
      if (leftChild) {
        DeleteNode(leftChild, value); // Recursively delete
      }
    } else if (Number(value) > Number(node.name)) {
      const rightChild = node.children.find((child) => Number(child?.name) >= Number(node.name));
      if (rightChild) {
        DeleteNode(rightChild, value); // Recursively delete
      }
    } else {
      // Node found, delete it
      node = null; // Delete node
    }

    return node; // Return the updated node
  };

  const handleDeleteNode = () => {
    if (!newNodeValue) return;

    const updatedTree = { ...treeData };
    const newTreeData = DeleteNode(updatedTree, newNodeValue); // Handle deletion
    setTreeData(newTreeData);
    setNewNodeValue(""); // Reset input
  };

  // Tree rendering function with animation
  const renderTree = (data) => {
    const container = treeRef.current;

    // Clear previous tree
    d3.select(container).select("svg").remove();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const root = d3.hierarchy(data, (d) => d.children);
    const treeLayout = d3.tree().size([width, height - 100]);
    treeLayout(root);

    const verticalOffset = 50;

    // Links
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + verticalOffset)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + verticalOffset)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);

    // Nodes
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y + verticalOffset})`)
      .attr("data-name", (d) => d.data.name); // Add data-name for easy selection

    node.append("circle")
      .attr("r", 5)
      .attr("fill", "#90caf9");

    node.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);
  };

  // Re-render tree whenever treeData changes
  useEffect(() => {
    if (treeData) {
      renderTree(treeData);
      console.log(treeData);
    }
  }, [treeData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "16px", marginLeft: sidebarWidth }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1e88e5" }}>
        Delete a Node from a Binary Tree
      </Typography>
      <Box sx={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "16px",
        backgroundColor: "#f9f9f9",
        maxWidth: "80%",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <Typography variant="body1" sx={{ marginBottom: "8px" }}>
          The deletion of a node in the binary search tree follows specific steps as illustrated below:
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: "8px", marginLeft: "16px" }}>
          1. <strong>Leaf Node:</strong> If the node is a leaf, it is simply removed.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: "8px", marginLeft: "16px" }}>
          2. <strong>One Child:</strong> If the node has one child, the child replaces the node.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: "8px", marginLeft: "16px" }}>
          3. <strong>Two Children:</strong> If the node has two children, the successor node replaces it.
        </Typography>
      </Box>
      <Box sx={{ width: "50%", height: "300px", borderRadius: "16px", padding: "24px", background: "linear-gradient(135deg, #ffffff, #e3f2fd)", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" }}>
        <div ref={treeRef} style={{ width: "100%", height: "100%" }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "30px", alignItems: "center" }}>
        {/* Tree & Value Inputs */}
        <Box sx={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <FormControl>
            <InputLabel id="tree-label">Binary Tree</InputLabel>
            <Select value={selectedTreeId} onChange={handleTreeChange} labelId="tree-label" label="Binary Tree">
              {binaryTrees.map((tree) => (
                <MenuItem key={tree.id} value={tree.id}>{tree.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Node Value to Delete"
            variant="outlined"
            value={newNodeValue}
            onChange={(e) => setNewNodeValue(e.target.value)}
          />
        </Box>

        {/* Animation Controls */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
          <Slider
            value={animationSpeed}
            onChange={(e, newValue) => setAnimationSpeed(newValue)}
            min={minSpeed}
            max={maxSpeed}
            step={1}
            valueLabelDisplay="auto"
            sx={{ width: "200px" }}
          />
          <Typography variant="subtitle1">Animation Speed</Typography>

          <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={isRunning}
              onClick={() => {
                if (isPaused) {
                  setIsPaused(false);
                  setIsRunning(true); // Set isRunning to true when unpaused
                } else {
                  handleDeleteNodeWithAnimation();
                }
              }}
            >
              {isPaused ? "Continue" : "Play"}
            </Button>
            <Button
              variant="contained"        
              color="primary"
              disabled={!isRunning || isPaused}
              onClick={() => setIsPaused(true)}
            >
              Pause
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Delete;
