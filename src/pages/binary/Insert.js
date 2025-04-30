import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, Slider, MenuItem } from "@mui/material";
import axios from "axios";
import * as d3 from "d3";
import { useAuth } from "../../components/AuthContext";
import { set } from "react-hook-form";

const Insert = ({ sidebarWidth }) => {
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

  const insertNodeWithAnimation = (node, value) => {
    if (!node) {
      return { name: value, children: [] };
    }
  
    if (!node.children) {
      node.children = [];
    }
  
    const highlightCurrentNode = (nodeName, color) => {
      d3.select(`[data-name="${nodeName}"] circle`)
        .transition()
        .duration(300)
        .attr("fill", color);
    };
  
    // Highlight the current node in yellow
    highlightCurrentNode(node.name, "#ffeb3b");
  
    // Timeout to simulate traversal delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        console.log(isRunning);
        
        if (isPausedRef.current) {
          await waitForUnpause(); // Wait until resumed
        }
        
        if (Number(value) < Number(node.name)) {
          const leftChild = node.children.find((child) => Number(child?.name) < Number(node.name));
          if (leftChild) {
            insertNodeWithAnimation(leftChild, value).then(() => resolve(node));
          } else {
            node.children.push(node.children[0]);
            node.children[0] = { name: value, children: [] };
            resolve(node);
          }
        } else if (Number(value) > Number(node.name)) {
          const rightChild = node.children.find((child) => Number(child?.name) >= Number(node.name));
          if (rightChild) {
            insertNodeWithAnimation(rightChild, value).then(() => resolve(node));
          } else {
            node.children.push({ name: value, children: [] });
            resolve(node);
          }
        }
  
        // Revert the current node color to default
        highlightCurrentNode(node.name, "#90caf9");
      }, maxSpeed * 100 - animationSpeed * 75); // Adjust the delay as needed
    });
  };

  // Function to check if a value already exists in the tree
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
  
  const handleInsertNodeWithAnimation = async () => {
    if (!newNodeValue) return;

    if (nodeExists(treeData, newNodeValue)) {
      alert("Node already exists in the tree!"); // Or any other UI indication
      return; // Exit if the node already exists
    }
    setIsRunning(true); // Animation starts here!
  
    const updatedTree = { ...treeData };
    await insertNodeWithAnimation(updatedTree, newNodeValue); // Wait for animations to complete
    setTreeData(updatedTree);
    setNewNodeValue("");
    setIsRunning(false); // Animation ends here!
  };  

  // Function to insert a node into the binary tree
  const insertNode = (node, value) => {
    // If node is null, create a new node
    if (!node) {
      return { name: value, children: [] }; // Create a new node with an empty children array
    }
  
    // Ensure the `children` array is always initialized
    if (!node.children) {
      node.children = [];
    }
  
    // If value is smaller, it belongs in the left subtree
    if (Number(value) < Number(node.name)) {
      // Find the left child if it exists
      const leftChild = node.children.find((child) => Number(child?.name) < Number(node.name));
  
      if (leftChild) {
        // Recursively insert into the left child
        insertNode(leftChild, value);
      } else {
        // If no left child, create a new one
        node.children.push(node.children[0]);
        node.children[0] = ({ name: value, children: [] });
      }
    } else if (Number(value) > Number(node.name)){
      // If value is greater or equal, it belongs in the right subtree
      const rightChild = node.children.find((child) => Number(child?.name) >= Number(node.name));
  
      if (rightChild) {
        // Recursively insert into the right child
        insertNode(rightChild, value);
      } else {
        // If no right child, create a new one
        node.children.push({ name: value, children: [] });
      }
    }
  
    return node; // Return the updated node
  };
  

  // Handle node insertion with animation
  const handleInsertNode = () => {
    if (!newNodeValue) return;

    const updatedTree = { ...treeData };
    const newTreeData = insertNode(updatedTree, newNodeValue);
    setTreeData(newTreeData);
    setNewNodeValue("");
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

    // Add transition for newly inserted node
    const newNode = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y + verticalOffset})`)
      .style("opacity", 0); // Initially hide new node

    newNode.append("circle")
      .attr("r", 5)
      .attr("fill", "#90caf9");

    newNode.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);

    // Animate new node insertion with D3 transition
    newNode.transition()
      .duration(500)
      .style("opacity", 1)
      .attr("transform", (d) => `translate(${d.x},${d.y + verticalOffset})`);
  };

  // Re-render tree whenever treeData changes
  useEffect(() => {
    if (treeData) {
      renderTree(treeData);
    }
  }, [treeData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "16px", marginLeft: sidebarWidth }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1e88e5" }}>
        Insert a Node into Binary Tree
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
        <Typography variant="body1" align="center" sx={{ color: "#555" }}>
        To add a new node into a Binary Search Tree (BST), start at the root and recursively traverse the tree, moving left if the new value is smaller than the current node or right if it's larger. Once an empty position is found, insert the new node while maintaining the BST properties.
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
      label="New Node Value"
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
            handleInsertNodeWithAnimation();
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

export default Insert;
