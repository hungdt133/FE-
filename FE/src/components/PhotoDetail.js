import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

function PhotoDetail() {
  const { photoId } = useParams();
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [photoDescription, setPhotoDescription] = useState("");
  const [showImageChangeModal, setShowImageChangeModal] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const fetchPhoto = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/photo/${photoId}`,
        {
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch photo");
      }
      
      const data = await response.json();
      setPhoto(data);
      setPhotoDescription(data.description || "");
    } catch (error) {
      console.error("Error fetching photo:", error);
    }
  };

  useEffect(() => {
    fetchPhoto();
  }, [photoId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/commentsOfPhoto/${photoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment }),
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      
      await fetchPhoto();
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/comments/${photoId}/${commentId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to delete comment");
        }
        
        await fetchPhoto();
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleEditComment = (commentId, currentComment) => {
    setEditingCommentId(commentId);
    setEditedComment(currentComment);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editedComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${photoId}/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment: editedComment }),
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update comment");
      }
      
      await fetchPhoto();
      setEditingCommentId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleBackToHome = () => {
    navigate(`/users/${user.userId}/photos`);
  };

  const handleUpdatePhoto = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/photos/${photoId}`,
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
        throw new Error("Failed to update photo");
      }
      
      await fetchPhoto();
      setShowEditModal(false);
      alert("Photo updated successfully!");
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to update photo. Please try again.");
    }
  };

  const handleImageChange = async () => {
    if (!newImage) {
      alert("Please select a new image");
      return;
    }

    const formData = new FormData();
    formData.append("file", newImage);
    formData.append("photoId", photoId);

    try {
      const response = await fetch(
        `http://localhost:5000/api/photos/${photoId}/image`,
        {
          method: "PUT",
          body: formData,
          credentials: "include",
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update image");
      }
      
      await fetchPhoto();
      setShowImageChangeModal(false);
      setNewImage(null);
      alert("Image updated successfully!");
    } catch (error) {
      console.error("Error updating image:", error);
      alert("Failed to update image. Please try again.");
    }
  };

  const handleDeletePhoto = async () => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/photos/${photoId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to delete photo");
        }
        
        alert("Photo deleted successfully!");
        navigate(`/users/${user.userId}/photos`);
      } catch (error) {
        console.error("Error deleting photo:", error);
        alert("Failed to delete photo. Please try again.");
      }
    }
  };

  if (!photo) return (
    <div className="container mt-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-2">Loading photo details...</p>
    </div>
  );

  const isPhotoOwner = photo.user_id._id === user.userId;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="photo-detail-container">
            <div className="photo-header mb-4">
              <h2 className="text-center mb-3">Photo Details</h2>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="photo-info">
                  <span className="text-muted">Posted by:</span>
                  <Link to={`/users/${photo.user_id}/photos`} className="ms-2 text-decoration-none">
                    {photo.user_id.first_name} {photo.user_id.last_name}
                  </Link>
                </div>
                {isPhotoOwner && (
                  <div className="photo-actions">
                    <button className="btn btn-outline-secondary me-2" onClick={() => setShowEditModal(true)}>
                      Edit
                    </button>
                    <button className="btn btn-outline-danger" onClick={handleDeletePhoto}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="photo-content mb-4">
              <img src={photo.file_name} alt="Photo" className="photo-detail-img mb-3" />
              <div className="photo-description p-3 bg-white rounded">
                <p className="mb-0">{photo.description || "No description provided."}</p>
              </div>
            </div>

            <div className="comments-section bg-white rounded p-4">
              <h4 className="mb-4 border-bottom pb-2">Comments</h4>
              <div className="comment-form mb-4">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                ></textarea>
                <button
                  className="btn btn-primary"
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                >
                  Post Comment
                </button>
              </div>

              <div className="comments-list">
                {photo.comments.map((comment) => (
                  <div key={comment._id} className="comment-item mb-3 p-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <Link
                          to={`/users/${comment.user_id}/photos`}
                          className="fw-bold text-decoration-none"
                        >
                          {comment.user_id.first_name} {comment.user_id.last_name}
                        </Link>
                        <small className="text-muted ms-2">
                          {new Date(comment.date_time).toLocaleDateString()}
                        </small>
                      </div>
                      {comment.user_id._id === user.userId && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="comment-text mb-0">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {showEditModal && (
            <>
              <div className="modal-backdrop"></div>
              <div className="modal d-block">
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Edit Photo Description</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowEditModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <textarea
                        className="form-control"
                        value={photoDescription}
                        onChange={(e) => setPhotoDescription(e.target.value)}
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleUpdatePhoto}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoDetail;
