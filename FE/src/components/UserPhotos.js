import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [users, setUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [selectedPhotoId, setSelectedPhotoId] = useState(null);
  const [userPhotoCounts, setUserPhotoCounts] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user);
  const isCurrentUserProfile = currentUser.userId === userId;

  const fetchData = async () => {
    try {
      const photosResponse = await fetch(
        `http://localhost:5000/api/photosOfUser/${userId}`,
        {
          credentials: "include",
        }
      );
      
      if (!photosResponse.ok) {
        throw new Error("Failed to fetch photos");
      }
      
      const photosData = await photosResponse.json();
      
      // Fetch comments count for each photo
      const photosWithComments = await Promise.all(
        photosData.map(async (photo) => {
          try {
            const photoDetailsResponse = await fetch(
              `http://localhost:5000/api/photo/${photo._id}`,
              {
                credentials: "include",
              }
            );
            
            if (photoDetailsResponse.ok) {
              const photoDetails = await photoDetailsResponse.json();
              return {
                ...photo,
                commentsCount: photoDetails.comments ? photoDetails.comments.length : 0
              };
            }
            return { ...photo, commentsCount: 0 };
          } catch (error) {
            console.error(`Error fetching comments for photo ${photo._id}:`, error);
            return { ...photo, commentsCount: 0 };
          }
        })
      );
      
      setPhotos(photosWithComments);
      
      const usersResponse = await fetch(
        "http://localhost:5000/api/users",
        {
          credentials: "include",
        }
      );
      
      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users");
      }
      
      const usersData = await usersResponse.json();
      setUsers(usersData);

      // Get photo counts for each user
      const photoCounts = {};
      for (const user of usersData) {
        const userPhotosResponse = await fetch(
          `http://localhost:5000/api/photosOfUser/${user._id}`,
          {
            credentials: "include",
          }
        );
        
        if (!userPhotosResponse.ok) {
          continue;
        }
        
        const userPhotosData = await userPhotosResponse.json();
        photoCounts[user._id] = userPhotosData.length;
      }
      setUserPhotoCounts(photoCounts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleAddPhoto = () => {
    setUploadFile(null);
    setUploadPreview(null);
    setUploadDescription("");
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      alert("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("description", uploadDescription);
    
    try {
      const response = await fetch("http://localhost:5000/api/photos/new", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      // Refresh all data
      await fetchData();
      setIsUploading(false);
      setShowUploadModal(false);
      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Photo upload failed:", error);
      setIsUploading(false);
      alert("Failed to upload photo. Please try again.");
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/photos/${photoId}`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Delete failed");
        }
        
        await fetchData();
        alert("Photo deleted successfully!");
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("Failed to delete photo. Please try again.");
      }
    }
  };

  const openEditModal = (photo) => {
    setSelectedPhotoId(photo._id);
    setPhotoDescription(photo.description || "");
    setShowEditModal(true);
  };

  const handleUpdatePhoto = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/photos/${selectedPhotoId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: photoDescription }),
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Update failed");
      }
      
      await fetchData();
      setShowEditModal(false);
      alert("Photo updated successfully!");
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to update photo. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-3">
          <div className="mb-4 p-3 bg-white rounded">
            <h3 className="mb-4 text-center border-bottom pb-3">Users</h3>
            <div className="user-list">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/users/${user._id}/photos`}
                  className={`user-list-item d-block p-3 mb-2 rounded ${
                    userId === user._id ? "active" : ""
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{user.first_name} {user.last_name}</h5>
                      {user.location && (
                        <div className="text-muted small">{user.location}</div>
                      )}
                    </div>
                    <span className="photo-count">{userPhotoCounts[user._id] || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-9">
          <h3 className="mb-3">Photos</h3>
          {photos.length === 0 ? (
            <div className="text-center p-5 bg-light rounded">
              <p>No photos found.</p>
              {isCurrentUserProfile && (
                <button 
                  className="btn btn-primary d-flex align-items-center justify-content-center mx-auto"
                  onClick={handleAddPhoto}
                  style={{ width: "200px" }}
                >
                  <i className="bi bi-cloud-upload me-2"></i> Upload Your First Photo
                </button>
              )}
            </div>
          ) : (
            <div className="row">
              {photos.map((photo) => (
                <div className="col-md-4" key={photo._id}>
                  <div className="card photo-list-card h-100 mb-4">
                    <img 
                      className="card-img-top photo-card-img" 
                      src={photo.file_name} 
                      alt="Photo"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <div className="card-text">
                        {photo.description && (
                          <div className="mb-2">{photo.description}</div>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p className="mb-0 text-muted small">
                              Uploaded by: {photo.user_id.first_name}
                            </p>
                            <p className="mb-0 text-muted small">
                              {new Date(photo.date_time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                          <Link
                            to={`/photos/${photo._id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View Details
                          </Link>
                          {isCurrentUserProfile && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeletePhoto(photo._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 mb-2">
                        <div className="comment-badge">
                          <i className="bi bi-chat-dots"></i>
                          <span>{photo.commentsCount || 0} comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Photo Modal */}
      {showEditModal && (
        <div className="modal-backdrop"></div>
      )}
      {showEditModal && (
        <div className="modal">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Photo</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={photoDescription}
                    onChange={(e) => setPhotoDescription(e.target.value)}
                    placeholder="Add a description for your photo"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpdatePhoto}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <>
          <div className="modal-backdrop"></div>
          <div className="modal d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0" style={{ backgroundColor: '#1e3a8a' }}>
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold text-white">Upload New Photo</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadPreview(null);
                      setUploadDescription("");
                    }}
                  ></button>
                </div>
                <div className="modal-body px-4">
                  {!uploadFile ? (
                    <div className="upload-container mb-3">
                      <div 
                        className="upload-area text-center p-5"
                        onClick={() => document.getElementById('photoInput').click()}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: '#2563eb',
                          borderRadius: '4px'
                        }}
                      >
                        <div className="mb-3">
                          <img 
                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiI+PC9yZWN0PjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ij48L2NpcmNsZT48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIj48L3BvbHlsaW5lPjwvc3ZnPg==" 
                            alt="upload" 
                            style={{ width: '64px', height: '64px' }}
                          />
                        </div>
                        <div className="text-white">
                          Click to select a photo
                        </div>
                        <input
                          type="file"
                          id="photoInput"
                          className="d-none"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </div>
                      <button
                        className="btn w-100 mt-3"
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none'
                        }}
                        onClick={() => document.getElementById('photoInput').click()}
                      >
                        Select Photo
                      </button>
                    </div>
                  ) : (
                    <div className="preview-container mb-3">
                      <img
                        src={uploadPreview}
                        alt="Preview"
                        className="img-preview"
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'contain',
                          backgroundColor: '#2563eb',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}

                  <div className="form-group mb-3">
                    <label className="form-label text-white">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={uploadDescription}
                      onChange={(e) => setUploadDescription(e.target.value)}
                      placeholder="Add a description for your photo (optional)"
                      style={{
                        backgroundColor: '#2563eb',
                        border: '1px solid #60a5fa',
                        color: 'white'
                      }}
                    ></textarea>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => {
                        setShowUploadModal(false);
                        setUploadFile(null);
                        setUploadPreview(null);
                        setUploadDescription("");
                      }}
                      style={{
                        backgroundColor: '#475569',
                        color: 'white',
                        border: 'none',
                        flex: '1'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={handleUploadSubmit}
                      disabled={!uploadFile || isUploading}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        flex: '1'
                      }}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Photo'}
                    </button>
                  </div>

                  <div className="mt-3">
                    <small className="text-white-50">Supported formats: JPG, PNG, GIF</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserPhotos;
