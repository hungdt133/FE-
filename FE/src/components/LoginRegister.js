import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../redux/actions";

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    login_name: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    location: "",
    description: "",
    occupation: "",
  });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (isLogin) {
      try {
        const response = await fetch("http://localhost:5000/api/admin/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            login_name: formData.login_name,
            password: formData.password,
          }),
          credentials: "include"
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Login failed");
        }
        
        const data = await response.json();
        dispatch(login(data));
        navigate(`/users/${data._id}/photos`);
      } catch (err) {
        setError(err.message || "Login failed");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Registration failed");
        }
        
        setFormData({
          login_name: "",
          password: "",
          confirmPassword: "",
          first_name: "",
          last_name: "",
          location: "",
          description: "",
          occupation: "",
        });
        setError("");
        alert("Registration successful! Please login.");
        setIsLogin(true);
      } catch (err) {
        setError(err.message || "Registration failed");
      }
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-0">{isLogin ? "Welcome Back!" : "Create Account"}</h2>
                  <p className="text-muted">{isLogin ? "Sign in to continue" : "Fill in your details to register"}</p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2 mb-4">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="login_name"
                      name="login_name"
                      placeholder="Username"
                      value={formData.login_name}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="login_name">Username</label>
                  </div>

                  <div className="form-floating mb-3">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="password">Password</label>
                  </div>

                  {!isLogin && (
                    <>
                      <div className="form-floating mb-3">
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder="Confirm Password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control"
                              id="first_name"
                              name="first_name"
                              placeholder="First Name"
                              value={formData.first_name}
                              onChange={handleChange}
                              required
                            />
                            <label htmlFor="first_name">First Name</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating mb-3">
                            <input
                              type="text"
                              className="form-control"
                              id="last_name"
                              name="last_name"
                              placeholder="Last Name"
                              value={formData.last_name}
                              onChange={handleChange}
                              required
                            />
                            <label htmlFor="last_name">Last Name</label>
                          </div>
                        </div>
                      </div>

                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="location"
                          name="location"
                          placeholder="Location"
                          value={formData.location}
                          onChange={handleChange}
                        />
                        <label htmlFor="location">Location (Optional)</label>
                      </div>

                      <div className="form-floating mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="occupation"
                          name="occupation"
                          placeholder="Occupation"
                          value={formData.occupation}
                          onChange={handleChange}
                        />
                        <label htmlFor="occupation">Occupation (Optional)</label>
                      </div>

                      <div className="form-floating mb-3">
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          placeholder="Description"
                          value={formData.description}
                          onChange={handleChange}
                          style={{ height: "100px" }}
                        ></textarea>
                        <label htmlFor="description">Description (Optional)</label>
                      </div>
                    </>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 mb-3"
                  >
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? (
                        <span>Don't have an account? <span className="text-primary">Sign Up</span></span>
                      ) : (
                        <span>Already have an account? <span className="text-primary">Sign In</span></span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
