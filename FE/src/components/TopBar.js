import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/actions";
import { logoutUser, uploadPhoto } from "../services/api";

function TopBar() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleAddPhoto = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadDescription("");
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("description", uploadDescription);

      await uploadPhoto(formData);
      
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadDescription("");
      window.location.reload(); // Refresh to show new photo
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Determine home page URL based on login status
  const homeUrl = user.isLoggedIn ? `/users/${user.userId}/photos` : "/login";

  return (
    <>
      <nav className="navbar">
        <Link to={homeUrl} className="navbar-brand">
          Photo Sharing App
        </Link>
        <div className="navbar-nav">
          {user.isLoggedIn ? (
            <>
              <div className="nav-item me-3 d-flex align-items-center text-light">
                Hi {user.firstName}
              </div>
              <button
                className="btn btn-outline-light me-2"
                onClick={handleAddPhoto}
              >
                Add Photo
              </button>
              <button className="btn btn-outline-light" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="nav-item text-light">Please Login</div>
          )}
        </div>
      </nav>

      {/* Upload Photo Modal */}
      {showUploadModal && <div className="modal-backdrop"></div>}
      {showUploadModal && (
        <div className="modal">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload New Photo</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  disabled={isUploading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div
                      className="upload-preview-container mb-3 d-flex align-items-center justify-content-center bg-light rounded"
                      style={{ height: "300px", cursor: "pointer" }}
                      onClick={() =>
                        document.getElementById("uploadPhotoInput").click()
                      }
                    >
                      {uploadPreview ? (
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <div className="text-center p-3">
                          <i
                            className="bi bi-cloud-arrow-up"
                            style={{ fontSize: "3rem" }}
                          ></i>
                          <p className="mt-2">Click to select a photo</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="uploadPhotoInput"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <button
                      className="btn btn-outline-primary w-100 mb-3"
                      onClick={() =>
                        document.getElementById("uploadPhotoInput").click()
                      }
                    >
                      {uploadFile ? "Change Photo" : "Select Photo"}
                    </button>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={5}
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                        placeholder="Add a description for your photo (optional)"
                      ></textarea>
                    </div>
                    <div className="text-muted mb-3">
                      <small>
                        <i className="bi bi-info-circle me-1"></i>
                        Supported formats: JPG, PNG, GIF
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleUpload}
                  disabled={!uploadFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Uploading...
                    </>
                  ) : (
                    <>Upload Photo</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TopBar;
