import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, FormControl, InputLabel, Select, Slider, MenuItem } from "@mui/material";
import axios from "axios";
import * as d3 from "d3";
import { useAuth } from "../../components/AuthContext";

const Inorder = ({ sidebarWidth }) => {
  const [treeData, setTreeData] = useState(null);
  const [binaryTrees, setBinaryTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState("");
  const [visitedNodes, setVisitedNodes] = useState([]);
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

  useEffect(() => {
    const fetchBinaryTrees = async () => {
      try {
        const response = user
          ? await axios.get(`http://localhost:5000/get-binary-trees?userId=${user.id}`)
          : await axios.get("http://localhost:5000/get-binary-trees");

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

  const handleTreeChange = async (event) => {
    const selectedId = event.target.value;
    setSelectedTreeId(selectedId);
    try {
      const response = await axios.get(`http://localhost:5000/get-binary-tree/${selectedId}`);
      setTreeData(response.data.elements);
    } catch (error) {
      console.error("Error loading tree data:", error);
    }
  };

  const waitForUnpause = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!isPausedRef.current) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });
  };

  const InorderTraversalWithAnimation = async (node) => {
    if (!node) return;
  
    const highlightCurrentNode = (nodeName, color) => {
      d3.select(`[data-name="${nodeName}"] circle`)
        .transition()
        .duration(300)
        .attr("fill", color);
    };
  
    // Traverse left child first
    if (node.children && node.children[0]) {
      await InorderTraversalWithAnimation(node.children[0]);
    }
  
    // Visit the current node
    highlightCurrentNode(node.name, "#ffeb3b");
    setVisitedNodes((prev) => [...prev, node.name]);
    await new Promise((resolve) => setTimeout(resolve, 1000 - animationSpeed * 75));
    if (isPausedRef.current) await waitForUnpause();
  
    // Traverse right child next
    if (node.children && node.children[1]) {
      await InorderTraversalWithAnimation(node.children[1]);
    }
  
    // Optionally, re-color the node to indicate it's done
    highlightCurrentNode(node.name, "#90caf9");
  };
  

  const handleInorderNodeWithAnimation = async () => {
    if (!treeData) return;
    d3.selectAll("circle").attr("fill", "#90caf9");
    setVisitedNodes([]);
    setIsRunning(true);
    await InorderTraversalWithAnimation(treeData);
    setIsRunning(false);
  };

  const renderTree = (data) => {
    const container = treeRef.current;
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

    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + verticalOffset)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + verticalOffset)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);

    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y + verticalOffset})`)
      .attr("data-name", (d) => d.data.name);

    node.append("circle")
      .attr("r", 5)
      .attr("fill", "#90caf9");

    node.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);
  };

  useEffect(() => {
    if (treeData) renderTree(treeData);
  }, [treeData]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "16px", marginLeft: sidebarWidth }}>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1e88e5" }}>
        Inorder traversal in a binary tree
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
            Nodes from the left subtree get visited first, followed by the root node and right subtree. Such a traversal visits all the nodes in the order of non-decreasing key sequence.
        </Typography>
      </Box>

      <Box sx={{ width: "50%", height: "300px", borderRadius: "16px", padding: "24px", background: "linear-gradient(135deg, #ffffff, #e3f2fd)", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" }}>
        <div ref={treeRef} style={{ width: "100%", height: "100%" }} />
      </Box>

      <Typography variant="h6" sx={{ mt: 4, color: "#1e88e5", fontWeight: "bold", border: "1px solid #90caf9", padding: "12px", borderRadius: "8px", backgroundColor: "#e3f2fd", width: "100%", textAlign: "center" }}>
        Visited Nodes (Inorder): {visitedNodes.join(" → ")}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, marginTop: "30px", alignItems: "center" }}>
        <Box sx={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <FormControl>
            <InputLabel id="tree-label">Binary Tree</InputLabel>
            <Select value={selectedTreeId} onChange={handleTreeChange} labelId="tree-label" label="Binary Tree">
              {binaryTrees.map((tree) => (
                <MenuItem key={tree.id} value={tree.id}>{tree.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

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
                  setIsRunning(true);
                } else {
                  handleInorderNodeWithAnimation();
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

export default Inorder;