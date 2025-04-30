import React, { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem } from "@mui/material";
import { Slider } from "@mui/material";
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import axios from "axios";
import { useAuth } from "../../components/AuthContext";

const DFSVisualizer = ({ sidebarWidth }) => {
  const [cyInstance, setCyInstance] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [queue, setQueue] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [distances, setDistances] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [graphData, setGraphData] = useState(null);
  const [startingNode, setStartingNode] = useState("f");  // New state for starting node
  const steps = [];
  const maxSpeed = 10;
  const minSpeed = 0;
  const [animationSpeed, setAnimationSpeed] = useState(maxSpeed / 2);
  const [graphType, setGraphType] = useState("directed");
  const [graphs, setGraphs] = useState([]);
  const [times, setTimes] = useState({});
  const [stepCounter, setStepCounter] = useState(1);  
  const { user } = useAuth();

  useEffect(() => {
    const fetchGraphs = async () => {
      try {
        let response = "";
        if (user) {
          response = await axios.get("http://localhost:5000/get-graphs?userId=" + user.id);
        } else {
          response = await axios.get("http://localhost:5000/get-graphs");
        }
        setGraphs(response.data);
        if (response.data.length > 0) {
          const firstGraphId = response.data[0].id;
          setGraphType(firstGraphId);
          const firstGraphResponse = await axios.get(`http://localhost:5000/get-graph/${firstGraphId}`);
          setGraphData(firstGraphResponse.data);

          // Initialize times
          const initialTimes = {};
          firstGraphResponse.data.elements.forEach((ele) => {
            if (ele.data && ele.data.id && /^[a-z]+$/i.test(ele.data.id)) {
              initialTimes[ele.data.id] = { d: 0, f: 0 };
            }
          });
          setTimes(initialTimes);
        }
      } catch (error) {
        console.error("Error fetching graph names:", error);
      }
    };

    fetchGraphs();
  }, []);

  const handleGraphChange = async (event) => {
    const selectedGraphId = event.target.value;
    setGraphType(selectedGraphId);

    if (cyInstance) {
      cyInstance.elements().removeClass("visited");
      cyInstance.fit();
    }

    setIsRunning(false);
    setIsCompleted(false);
    setIsPaused(false);
    setQueue([]);
    setVisitedNodes([]);
    setCurrentNode(null);
    setStepIndex(0);
    steps.length = 0;

    try {
      const response = await axios.get(`http://localhost:5000/get-graph/${selectedGraphId}`);
      const newGraph = response.data;
      const initialDistances = {};
      const initialTimes = {};
      newGraph.elements.forEach((node) => {
        initialDistances[node.data.id] = Infinity;
        initialTimes[node.data.id] = { d: 0, f: 0 };
      });
      setDistances(initialDistances);
      setGraphData(newGraph);
      if (cyInstance) {
        cyInstance.elements().remove();
        cyInstance.add(newGraph.elements);
        cyInstance.layout({
          name: "grid",
          spacingFactor: 1,
          fit: true,
        }).run();
      }
    } catch (error) {
      console.error("Error loading graph data:", error);
    }
  };

  const handleStartingNodeChange = (event) => {
    setStartingNode(event.target.value);  // Update the starting node based on dropdown selection
  };

  const handleSpeedChange = (event, newValue) => {
    setAnimationSpeed(newValue);
  };

  const layout = graphData && {
    name: "grid",
    directed: graphData.is_directed,
    spacingFactor: 1,
    fit: true,
  };

  const style = graphData ? [
    {
      selector: "node",
      style: {
        label: "data(label)",
        "background-color": "lightgray",
        "font-size": "12px",
        "text-valign": "center",
        "text-halign": "center",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        "line-color": "#000",
        "width": 2,
        "target-arrow-shape": graphData.is_directed ? "triangle" : "none",
        "target-arrow-color": "#000",
      },
    },
    {
      selector: ".visited",
      style: {
        "background-color": "green",
        "line-color": "green",
        "target-arrow-color": "green",
      },
    },
  ] : [];

  const startDFS = () => {
    if (isPaused) {
      setIsRunning(true);
      setIsPaused(false);
      return;
    }

    setIsRunning(true);
    setIsCompleted(false);
    setIsPaused(false);
    setQueue([startingNode]);  // Start the BFS from the selected node
    setVisitedNodes([]);
    setCurrentNode(null);
    setStepIndex(0);
    steps.length = 0;

    cyInstance.nodes().removeClass("visited");

    const initialDistances = {};
    const initialTimes = {};
    graphData.elements
      .filter((ele) => ele.data && ele.data.id)
      .forEach((node) => {
        initialDistances[node.data.id] = Infinity;
        initialTimes[node.data.id] = { d: 0, f: 0 };
      });

    initialDistances[startingNode] = 0;  // Set the initial distance for the selected starting node
    initialTimes[startingNode].d = 1;  // Set the initial distance for the selected starting node
    setDistances(initialDistances);
    setTimes(initialTimes);
    setStepCounter(0);
  };

  const stopDFS = () => {
    setIsRunning(false);
    setIsCompleted(true);
    setIsPaused(true);
  };

  useEffect(() => {
    if (isRunning && queue.length > 0) {
      const timer = setTimeout(() => {
        const currentNode = queue[0];
  
        // Handle discovery (d) if not already visited
        if (!visitedNodes.includes(currentNode)) {
          const discoveryTime = stepCounter + 1;
          setStepCounter(discoveryTime);
          setVisitedNodes((prev) => [...prev, currentNode]);
          setCurrentNode(currentNode);
          cyInstance.$(`#${currentNode}`).addClass("visited");
          setTimes((prev) => ({
            ...prev,
            [currentNode]: { ...prev[currentNode], d: discoveryTime },
          }));
  
          // Add neighbors to the stack (LIFO behavior for DFS)
          const neighbors = graphData.is_directed
            ? cyInstance.$(`#${currentNode}`).outgoers("node").map((n) => n.id())
            : [
                ...cyInstance.$(`#${currentNode}`).outgoers("node").map((n) => n.id()),
                ...cyInstance.$(`#${currentNode}`).incomers("node").map((n) => n.id()),
              ];
  
          neighbors
            .filter((neighbor) => !times[neighbor]?.f) // Exclude finished neighbors
            .sort()
            .reverse() // LIFO ordering
            .forEach((neighbor) => {
              if (!visitedNodes.includes(neighbor)) {
                setQueue((prev) => [neighbor, ...prev]);
              }
            });
        } else if (!times[currentNode]?.f) {
          // Handle finishing (f) only if not already finished
          const finishingTime = stepCounter + 1;
          setStepCounter(finishingTime);
          setTimes((prev) => ({
            ...prev,
            [currentNode]: { ...prev[currentNode], f: finishingTime },
          }));
          cyInstance.$(`#${currentNode}`).addClass("finished");
  
          // Remove the finished node from the queue
          setQueue((prev) => prev.slice(1));
        } else {
          // If the node is already finished, just remove it from the queue
          setQueue((prev) => prev.slice(1));
        }
      }, maxSpeed * 100 - animationSpeed * 75);
  
      return () => clearTimeout(timer);
    } else if (isRunning && queue.length === 0 && cyInstance) {
      // If traversal is done, check for undiscovered nodes
      const allNodes = cyInstance.nodes().map((n) => n.id()); // Get all nodes
      const undiscoveredNodes = allNodes.filter((node) => !times[node]?.d); // Nodes with no discovery time

      if (undiscoveredNodes.length > 0) {
        // Start a new traversal for the first undiscovered node
        setQueue([undiscoveredNodes[0]]);
        setIsRunning(true);
      } else {
        setIsRunning(false);
      }
    } else if (queue.length === 0) {
      setIsRunning(false);
    }
  }, [isRunning, queue, visitedNodes, cyInstance, graphData, stepCounter, animationSpeed, maxSpeed, times]);  

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
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1e88e5" }}>
        Depth-First Search (DFS)
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
          Breadth-first search (BFS) is an algorithm used for traversing or searching tree or graph data structures. It begins at the root of a tree (or an arbitrary node of a graph, sometimes referred to as the "search key") and examines all neighboring nodes (vertices) at the current level before proceeding to the next levels.
        </Typography>
      </Box>

      {graphData && (
        <>
          <Box sx={{ width: "400px", height: "300px", borderRadius: "16px", padding: "24px", background: "linear-gradient(135deg, #ffffff, #e3f2fd)", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" }}>
            <CytoscapeComponent
              elements={graphData.elements}
              layout={layout}
              style={{ width: "100%", height: "100%" }}
              stylesheet={style}
              cy={(cy) => {
                setCyInstance(cy);
                cy.zoomingEnabled(false);
                cy.userZoomingEnabled(false);
                cy.panningEnabled(false);
                cy.userPanningEnabled(false);
                cy.fit();
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: "16px", justifyContent: "center"}}>
            <Button variant="contained" color="primary" onClick={startDFS} disabled={isRunning} sx={{ height: "56px" }}>
              {isPaused ? "Continue" : "Play"}
            </Button>
            <Button variant="contained" color="secondary" onClick={stopDFS} disabled={!isRunning} sx={{ height: "56px" }}>
              Stop
            </Button>
            {/* <Select value={graphType} onChange={handleGraphChange}>
              {graphs.map((graph) => (
                <MenuItem key={graph.id} value={graph.id}>{graph.name}</MenuItem>
              ))}
            </Select> */}
            <FormControl sx={{ marginBottom: "16px" }}>
              <InputLabel id="graph-label">Graph</InputLabel>
              <Select
                value={graphType}
                onChange={handleGraphChange}
                labelId="graph-label"
                label="Graph"
              >
                {graphs.map((graph) => (
                  <MenuItem key={graph.id} value={graph.id}>{graph.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ marginBottom: "16px", width: "100px" }}>
              <InputLabel id="starting-node-label">Starting Node</InputLabel>
              <Select
                value={startingNode}
                onChange={handleStartingNodeChange}
                labelId="starting-node-label"
                label="Starting Node"
              >
                {graphData.elements
                  .filter((ele) => ele.data && ele.data.id && /^[a-z]+$/i.test(ele.data.id)) // Filter out nodes without ids
                  .map((node) => (
                    <MenuItem key={node.data.id} value={node.data.id}>
                      {node.data.id}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Slider
              value={animationSpeed}
              onChange={handleSpeedChange}
              min={minSpeed}
              max={maxSpeed}
              step={1}
              valueLabelDisplay="auto"
              sx={{ width: "150px"}}
            />
            <Typography variant="subtitle1" gutterBottom>Animation Speed</Typography>
          </Box>

          <TableContainer component={Paper} sx={{ maxWidth: "800px", marginTop: "16px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Node</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Discovery</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Finishing Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>                
                {graphData.elements
                  .filter((ele) => ele.data && ele.data.id && /^[a-z]+$/i.test(ele.data.id))
                  .map((node) => (
                      <TableRow key={node.data.id}>
                        <TableCell align="center">{node.data.id}</TableCell>
                        <TableCell align="center">{times[node.data.id].d ?? "-"}</TableCell>
                        <TableCell align="center">{times[node.data.id].f ?? "-"}</TableCell>
                      </TableRow>
                      // {`${node.data.id}: ${distances[node.data.id] === Infinity ? "∞" : distances[node.data.id] === undefined ? "0" : distances[node.data.id]}`}
                  ))}
                {/* <TableRow>
                  <TableCell align="center">{queue.join(", ") || "Queue is empty"}</TableCell>
                  <TableCell align="center">{visitedNodes.join(", ") || "No visited nodes"}</TableCell>
                  <TableCell align="center">{currentNode || "No current node"}</TableCell>
                  <TableCell align="center">
                    {graphData.elements
                      .filter((ele) => ele.data && ele.data.id && /^[a-z]+$/i.test(ele.data.id))
                      .map((node) => (
                        <div key={node.data.id}>
                          {`${node.data.id}: ${distances[node.data.id] === Infinity ? "∞" : distances[node.data.id] === undefined ? "0" : distances[node.data.id]}`}
                        </div>
                      ))}
                  </TableCell>
                </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default DFSVisualizer;