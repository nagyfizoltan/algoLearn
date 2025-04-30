import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material"; // <-- Import Box here
import Register from "../../pages/Register";
import Login from "../../pages/Login";
import Navbar from "../Navbar";
import ProtectedRoute from "./ProtectedRoutes";
import Home from "../../pages/Home";
import BinaryMenu from "../../pages/BinaryMenu";
import GraphMenu from "../../pages/GraphMenu";
import BFSVisualizer from "../../pages/graph/BFSVisualizer";
import DFSVisualizer from "../../pages/graph/DFSVisualizer";
import MyData from "../../pages/MyData";
import NewGraph from "../../pages/NewGraph";
import NewBinary from "../../pages/NewBinary";
import About from "../../pages/About";
import Sidebar from "../Sidebar";
import ScrollToTopButton from "../ScrollToTopButton";
import routes from "../../routes.json";
import Insert from "../../pages/binary/Insert";
import Delete from "../../pages/binary/Delete";
import Search from "../../pages/binary/Search";
import Preorder from "../../pages/binary/Preorder";
import Inorder from "../../pages/binary/Inorder";
import Postorder from "../../pages/binary/Postorder";
import Profile from "../../pages/Profile";

function AppRoutes() {
  const sidebarWidth = "300px";
  const navbarHeight = "64px";

  return (
    <Router>
      <ScrollToTopButton/>
      <Navbar height={navbarHeight} />
      <Box sx={{ display: "flex", marginTop: navbarHeight }}>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            padding: "20px",
            overflowY: "auto", // Allows scrolling if content overflows
          }}
        >
          <Routes>
            {routes.map((route) => (
              route.protected ? (
                // Protected Route
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.path === "/newGraph" ? (
                      <ProtectedRoute>
                        <NewGraph sidebarWidth={sidebarWidth} />
                      </ProtectedRoute>
                    ) : route.path === "/newBinary" ? (
                      <ProtectedRoute>
                        <NewBinary sidebarWidth={sidebarWidth} />
                      </ProtectedRoute>
                    ) : route.path === "/profile" ? (
                      <ProtectedRoute>
                        <Profile sidebarWidth={sidebarWidth} />
                      </ProtectedRoute>
                    ) : null
                  }
                />
              ) : (
                // Public Route
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.path === "/register" ? (
                      <Register sidebarWidth={sidebarWidth} />
                    ) : route.path === "/login" ? (
                      <Login sidebarWidth={sidebarWidth} />
                    ) : route.path === "/binary" ? (
                      <BinaryMenu sidebarWidth={sidebarWidth} />
                    ) : route.path === "/insert-node" ? (
                      <Insert sidebarWidth={sidebarWidth} />
                    ) : route.path === "/delete-node" ? (
                      <Delete sidebarWidth={sidebarWidth} />
                    ) : route.path === "/search-node" ? (
                      <Search sidebarWidth={sidebarWidth} />
                    ) : route.path === "/pre-order" ? (
                      <Preorder sidebarWidth={sidebarWidth} />
                    ) : route.path === "/in-order" ? (
                      <Inorder sidebarWidth={sidebarWidth} />
                    ) : route.path === "/post-order" ? (
                      <Postorder sidebarWidth={sidebarWidth} />
                    ) : route.path === "/graph" ? (
                      <GraphMenu sidebarWidth={sidebarWidth} />
                    ) : route.path === "/bfs" ? (
                      <BFSVisualizer sidebarWidth={sidebarWidth} />
                    ) : route.path === "/dfs" ? (
                      <DFSVisualizer sidebarWidth={sidebarWidth} />
                    ) : route.path === "/" ? (
                      <Home sidebarWidth={sidebarWidth} />
                    ) : route.path === "/myData" ? (
                      <MyData sidebarWidth={sidebarWidth} />
                    ) : route.path === "/about" ? (
                      <About sidebarWidth={sidebarWidth} />
                    ) : null
                  }
                />
              )
            ))}
          </Routes>
        </Box>
        {/* Sidebar */}
        <Sidebar width={sidebarWidth} navbarHeight={navbarHeight} />
      </Box>
    </Router>
  );
}

export default AppRoutes;
