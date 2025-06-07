import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import store from "./redux/store";
import TopBar from "./components/TopBar";
import LoginRegister from "./components/LoginRegister";
import UserPhotos from "./components/UserPhotos";
import PhotoDetail from "./components/PhotoDetail";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.user);
  return user.isLoggedIn ? children : <Navigate to="/login" />;
};

const Home = () => {
  const user = useSelector((state) => state.user);
  return <Navigate to={user.isLoggedIn ? `/users/${user.userId}/photos` : "/login"} />;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <TopBar />
        <Routes>
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/users/:userId/photos"
            element={
              <ProtectedRoute>
                <UserPhotos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/photos/:photoId"
            element={
              <ProtectedRoute>
                <PhotoDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
