import React, { useEffect, useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Button, Box, Typography, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import AOS from "aos";
import "aos/dist/aos.css";
import * as d3 from "d3";
import { useLanguage } from "../components/LanguageContext";

const MyData = ({ sidebarWidth }) => {
  const { t } = useLanguage();
  const [graphs, setGraphs] = useState([]);
  const [graphElements, setGraphElements] = useState({});
  const [binaryTrees, setBinaryTrees] = useState([]);  // New state for binary trees
  const [binaryTreeElements, setBinaryTreeElements] = useState({});  // New state for binary tree elements
  const [loading, setLoading] = useState(true);
  const cyRefs = useRef({});  // Reference object to store multiple Cytoscape instances
  const d3Refs = useRef({});  // Reference object to store D3 tree SVG containers
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  useEffect(() => {
    const fetchGraphsAndTrees = async () => {
      try {
        let response = "";
        let treeResponse = "";
        if (user) {
          response = await fetch(`http://localhost:5000/get-graphs?userId=${user.id}`);
          treeResponse = await fetch(`http://localhost:5000/get-binary-trees?userId=${user.id}`);
        } else {
          response = await fetch(`http://localhost:5000/get-graphs`);
          treeResponse = await fetch(`http://localhost:5000/get-binary-trees`);
        }
        const data = await response.json();
        setGraphs(data);

        const elementsData = {};
        for (const graph of data) {
          const graphRes = await fetch(`http://localhost:5000/get-graph/${graph.id}`);
          const graphData = await graphRes.json();
          elementsData[graph.id] = graphData;
        }

        setGraphElements(elementsData);

        // Fetch Binary Trees
        const treeData = await treeResponse.json();
        setBinaryTrees(treeData);

        const treeElementsData = {};
        for (const tree of treeData) {
          const treeRes = await fetch(`http://localhost:5000/get-binary-tree/${tree.id}`);
          const treeData = await treeRes.json();
          treeElementsData[tree.id] = treeData;
        }
        
        console.log(binaryTrees); // Debugging line to check tree data structure
        setBinaryTreeElements(treeElementsData);
      } catch (err) {
        console.error("Failed to fetch graphs and trees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraphsAndTrees();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      // Trigger resize and fit for all Cytoscape instances
      Object.values(cyRefs.current).forEach((cy) => {
        if (cy) {
          cy.resize(); // Update the graph container size
          cy.fit(); // Re-fit the graph to its container
        }
      });

      // Trigger resize for all D3 tree instances
      Object.values(d3Refs.current).forEach((svg) => {
        if (svg) {
          const { clientWidth: width, clientHeight: height } = svg.parentElement;
          svg.setAttribute("width", width);
          svg.setAttribute("height", height);
        }
      });
    };

    // Attach and clean up the resize listener
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getStylesheet = (isDirected) => [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "background-color": "#90caf9",
        "text-valign": "center",
        "text-halign": "center",
        color: "#000",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "line-color": "#424242",
        "width": 2,
        "target-arrow-shape": isDirected ? "triangle" : "none",
        "target-arrow-color": "#424242",
      },
    },
  ];

  const layout = {
    name: "grid",
    spacingFactor: 1.1,
    fit: true,
  };

  // D3 Tree rendering function
  const renderTree = (treeData, treeId) => {
    const container = d3Refs.current[treeId];
  
    // Clear previous tree
    d3.select(container).select("svg").remove();
  
    const width = container.clientWidth;
    const height = container.clientHeight;
  
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height);
  
    const root = d3.hierarchy(treeData, (d) => d.children);
    const treeLayout = d3.tree().size([width, height - 100]); // Adjust height for padding
    treeLayout(root);
  
    const verticalOffset = 50; // Add padding to the top
  
    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y + verticalOffset) // Apply vertical offset
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y + verticalOffset) // Apply vertical offset
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2);
  
    const node = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y + verticalOffset})`); // Apply vertical offset
  
    node.append("circle")
      .attr("r", 5)
      .attr("fill", "#90caf9");
  
    node.append("text")
      .attr("dy", -10)
      .attr("text-anchor", "middle")
      .text((d) => d.data.name);
  };
  

  return (
    <Box
      sx={{
        padding: "24px",
        marginLeft: sidebarWidth,
        width: `calc(100% - ${sidebarWidth}px)`,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ fontWeight: "bold", mb: 4 }}
        data-aos="zoom-in"
      >
        {t.myData.title}
      </Typography>

      <section
        style={{ width: "100%" }}
        data-aos="zoom-in"
        data-aos-delay="200"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5">📊 {t.myData.graphs.title}</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/newGraph")} // Navigate to /newGraph
          >
            {t.myData.graphs.addButton}
          </Button>
        </Box>

        {loading ? (
          <Typography>{t.myData.loading}</Typography>
        ) : graphs.length === 0 ? (
          <Typography>{t.myData.graphs.noData}</Typography>
        ) : (
          <Grid container spacing={6}>
            {graphs.map((graph) => {
              const data = graphElements[graph.id];

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={graph.id}>
                  <Paper
                    sx={{
                      padding: 2,
                      width: "100%", // Full width for responsiveness
                      height: "auto", // Dynamically adapt height
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      boxShadow: 3,
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, textAlign: "center", wordWrap: "break-word" }}
                    >
                      {graph.name}
                    </Typography>

                    {data ? (
                      <CytoscapeComponent
                        elements={data.elements}
                        layout={layout}
                        style={{
                          width: "100%", // Fill parent container width
                          height: "180px", // Initial height
                        }}
                        stylesheet={getStylesheet(data.is_directed)}
                        cy={(cy) => {                          
                          cy.zoomingEnabled(false);
                          cy.userZoomingEnabled(false);
                          cy.panningEnabled(false);
                          cy.userPanningEnabled(false); // Disable user-triggered zoom
                          cyRefs.current[graph.id] = cy; // Store each Cytoscape instance
                          cy.fit(); // Fit the graph to its container on load
                        }}
                      />
                    ) : (
                      <Typography variant="body2">Loading...</Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </section>

      <section 
        style={{ marginTop: "3rem" }}
        data-aos="zoom-in"
        data-aos-delay="400"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" gutterBottom>🌲 {t.myData.binaryTrees.title}</Typography>
          
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/newBinary")} // Navigate to /newBinaryTree
            sx={{ mb: 2 }}
          >
            {t.myData.binaryTrees.addButton}
          </Button>
        </Box>

        {loading ? (
          <Typography>{t.myData.loading}</Typography>
        ) : binaryTrees.length === 0 ? (
          <Typography>{t.myData.binaryTrees.noData}</Typography>
        ) : (
          <Grid container spacing={6}>
            {binaryTrees.map((tree) => {
              const data = binaryTreeElements[tree.id];

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={tree.id}>
                  <Paper
                    sx={{
                      padding: 2,
                      width: "100%", // Full width for responsiveness
                      height: "auto", // Dynamically adapt height
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      boxShadow: 3,
                      borderRadius: "8px",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, textAlign: "center", wordWrap: "break-word" }}
                    >
                      {tree.name}
                    </Typography>

                    {data ? (
                      console.log(data.elements), // Debugging line to check data structure
                      <div
                        ref={(el) => {
                          if (el && data && !d3Refs.current[tree.id]) {
                            d3Refs.current[tree.id] = el;
                            renderTree(data.elements, tree.id);
                          }
                        }}
                        style={{
                          width: "100%", // Fill parent container width
                          height: "300px", // Adjust based on need
                        }}
                      />
                    ) : (
                      <Typography variant="body2">Loading...</Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </section>
    </Box>
  );
};

export default MyData;
