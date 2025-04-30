import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, Slider, MenuItem } from "@mui/material";
import axios from "axios";
import * as d3 from "d3";
import { useAuth } from "../../components/AuthContext";
import { set } from "react-hook-form";

const Search = ({ sidebarWidth }) => {
  const [treeData, setTreeData] = useState(null);
  const [binaryTrees, setBinaryTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState("");
  const [searchedNode, setsearchedNode] = useState("");
  const treeRef = useRef(null);
  const { user } = useAuth();
  const maxSpeed = 10;
  const minSpeed = 0;
  const [animationSpeed, setAnimationSpeed] = useState(maxSpeed / 2);
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(isPaused);
  const [isRunning, setIsRunning] = useState(false);
  const [searchResult, setSearchResult] = useState(null); // null | true | false

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

  const SearchNodeWithAnimation = async (node, value) => {
    if (!node) return false;
  
    const highlightCurrentNode = (nodeName, color) => {
      d3.select(`[data-name="${nodeName}"] circle`)
        .transition()
        .duration(300)
        .attr("fill", color);
    };
  
    // Highlight the current node
    highlightCurrentNode(node.name, "#ffeb3b");
  
    await new Promise((resolve) =>
      setTimeout(resolve, maxSpeed * 100 - animationSpeed * 75)
    );
  
    if (isPausedRef.current) {
      await waitForUnpause();
    }
  
    const nodeValue = Number(node.name);
    const searchValue = Number(value);
  
    if (nodeValue === searchValue) {
      highlightCurrentNode(node.name, "#4caf50"); // Green = found
      return true;
    }
  
    const direction = searchValue < nodeValue ? "left" : "right";
    const nextChild = node.children?.find(child =>
      direction === "left" ? Number(child.name) < nodeValue : Number(child.name) >= nodeValue
    );
  
    const found = nextChild ? await SearchNodeWithAnimation(nextChild, value) : false;
  
    // Reset current node color
    highlightCurrentNode(node.name, "#90caf9");
  
    return found;
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
  
  const handleSearchNodeWithAnimation = async () => {
    if (!searchedNode) return;
    
    d3.selectAll("circle").attr("fill", "#90caf9");
  
    setIsRunning(true);
    const exists = await SearchNodeWithAnimation(treeData, searchedNode);
    setIsRunning(false);
    setsearchedNode("");
    setSearchResult(exists);
  
    // if (exists) {
    //   alert("✅ Node FOUND in the tree!");
    // } else {
    //   alert("❌ Node NOT FOUND in the tree.");
    // }
  };
  

  // Function to Search a node into the binary tree
  const SearchNode = (node, value) => {
    if (!node) return false;
  
    const nodeValue = Number(node.name);
    const searchValue = Number(value);
  
    if (nodeValue === searchValue) return true;
  
    const direction = searchValue < nodeValue ? "left" : "right";
    const nextChild = node.children?.find(child =>
      direction === "left" ? Number(child.name) < nodeValue : Number(child.name) >= nodeValue
    );
  
    return nextChild ? SearchNode(nextChild, value) : false;
  };  
  

  // Handle node Searchion with animation
  const handleSearchNode = () => {
    if (!searchedNode) return;

    const updatedTree = { ...treeData };
    const newTreeData = SearchNode(updatedTree, searchedNode);
    setTreeData(newTreeData);
    setsearchedNode("");
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

    // Add transition for newly Searched node
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

    // Animate new node Searchion with D3 transition
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
        Search for a node in a binary tree
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
          The data structure must be modified in such a way that the properties of BST continue to hold. New nodes are Searched as leaf nodes in the BST.
        </Typography>
      </Box>
      <Box sx={{ width: "50%", height: "300px", borderRadius: "16px", padding: "24px", background: "linear-gradient(135deg, #ffffff, #e3f2fd)", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" }}>
        <div ref={treeRef} style={{ width: "100%", height: "100%" }} />
      </Box>
      {searchResult !== null && (
        <Typography
            variant="h6"
            sx={{
            mt: 2,
            color: searchResult ? "green" : "red",
            fontWeight: "bold",
            transition: "all 0.3s ease"
            }}
        >
            {searchResult ? "✅ Node FOUND in the tree!" : "❌ Node NOT FOUND in the tree."}
        </Typography>
        )}
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
      label="Node To Be Found"
      variant="outlined"
      value={searchedNode}
      onChange={(e) => setsearchedNode(e.target.value)}
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
            handleSearchNodeWithAnimation();
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

export default Search;
