import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { decodeToken, isAdmin } from '../../utilities/authUtils';
import icon from "../../assets/iconpf.jpg";
import "./TubeKids.css";

const VideoManagement = () => {
  const navigate = useNavigate();
  const user = decodeToken();
  const userEmail = user?.email;

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/profile-selector');
    }
  }, []);

  // Estados para gestionar videos y playlists
  const [videos, setVideos] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, videoList, playlistList, addVideo, addPlaylist, editVideo, editPlaylist, playlistDetail
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Estados para formularios
  const [videoForm, setVideoForm] = useState({
    id: null,
    name: "",
    url: "",
    description: "",
    thumbnail: ""
  });

  const [playlistForm, setPlaylistForm] = useState({
    id: null,
    name: "",
    description: "",
    assignedProfiles: [],
    videos: []
  });

  // Estados para errores de formulario
  const [videoFormErrors, setVideoFormErrors] = useState({});
  const [playlistFormErrors, setPlaylistFormErrors] = useState({});

  // Cargar datos iniciales (simulados)
  useEffect(() => {
    const fetchRestrictedProfiles = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/restricted-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch restricted profiles");
        const data = await response.json();
        const formattedProfiles = data.map(profile => ({
          id: profile._id,
          name: profile.name,
          avatar: profile.avatar || `https://via.placeholder.com/60/CCCCCC/FFFFFF?text=${profile.name?.charAt(0).toUpperCase() || 'P'}`
        }));
        setProfiles(formattedProfiles);
      } catch (error) {
        console.error("Error loading profiles:", error);
      }
    };

    const fetchUserVideos = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/videos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch videos");
        const data = await response.json();
    
        // Filtrar por usuario logueado
        const filtered = data.filter(video => video.userId === user.id);
        setVideos(filtered);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };
    

    const fetchUserPlaylists = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/playlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch playlists");
        const data = await response.json();
    
        // 🔐 Filtrar playlists por usuario logueado
        const filtered = data.filter(playlist => playlist.userId === user.id);
        setPlaylists(filtered);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    fetchRestrictedProfiles();
    fetchUserVideos();
    fetchUserPlaylists();
  }, []);

  // Extraer video de YouTube ID
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Generar thumbnail de YouTube
  const getYoutubeThumbnail = (url) => {
    const videoId = getYoutubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : "https://via.placeholder.com/120/CCCCCC/FFFFFF?text=Video";
  };

  // Validar formulario de video
  const validateVideoForm = () => {
    const errors = {};

    if (!videoForm.name.trim()) {
      errors.name = "Video name is required";
    }

    if (!videoForm.url.trim()) {
      errors.url = "YouTube URL is required";
    } else if (!getYoutubeId(videoForm.url)) {
      errors.url = "Please enter a valid YouTube URL";
    }

    setVideoFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar formulario de playlist
  const validatePlaylistForm = () => {
    const errors = {};

    if (!playlistForm.name.trim()) {
      errors.name = "Playlist name is required";
    }

    if (playlistForm.assignedProfiles.length === 0) {
      errors.assignedProfiles = "Please select at least one profile";
    }

    setPlaylistFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío de formulario de video
  const handleVideoSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateVideoForm()) return;
  
    const youtubeId = getYoutubeId(videoForm.url);
    const thumbnail = getYoutubeThumbnail(videoForm.url);
  
    const updatedVideo = {
      name: videoForm.name,
      url: videoForm.url,
      description: videoForm.description,
      thumbnail
    };
  
    try {
      const token = localStorage.getItem("token");
  
      if (videoForm.id) {
        // EDITAR video existente
        const response = await fetch(`http://localhost:5000/api/videos/${videoForm.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedVideo)
        });
  
        if (!response.ok) throw new Error("Failed to update video");
  
        const updated = await response.json();
        setVideos(videos.map((v) => (v._id === updated._id ? updated : v)));
      } else {
        // CREAR nuevo video
        const response = await fetch("http://localhost:5000/api/videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedVideo)
        });
  
        if (!response.ok) throw new Error("Failed to add video");
  
        const createdVideo = await response.json();
        setVideos([...videos, createdVideo]);
      }
  
      // Limpiar formulario
      setVideoForm({
        id: null,
        name: "",
        url: "",
        description: "",
        thumbnail: ""
      });
  
      setCurrentView(selectedPlaylist ? "playlistDetail" : "videoList");
    } catch (error) {
      console.error("Error saving video:", error);
    }
  };
  
  

  // Manejar envío de formulario de playlist
  const handlePlaylistSubmit = async (e) => {
  e.preventDefault();

  if (!validatePlaylistForm()) return;

  try {
    const token = localStorage.getItem("token");

    const playlistData = {
      name: playlistForm.name,
      description: playlistForm.description,
      assignedProfiles: playlistForm.assignedProfiles,
      videos: playlistForm.videos
    };

    let response;
    if (playlistForm.id) {
      // Editar playlist
      response = await fetch(`http://localhost:5000/api/playlists/${playlistForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(playlistData)
      });
    } else {
      // Crear playlist
      response = await fetch("http://localhost:5000/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(playlistData)
      });
    }

    if (!response.ok) throw new Error("Error saving playlist");

    const savedPlaylist = await response.json();

    if (playlistForm.id) {
      // Actualizar en estado local
      setPlaylists(playlists.map(p => p._id === savedPlaylist._id ? savedPlaylist : p));
    } else {
      // Agregar a estado local
      setPlaylists([...playlists, savedPlaylist]);
    }

    // Limpiar formulario
    setPlaylistForm({
      id: null,
      name: "",
      description: "",
      assignedProfiles: [],
      videos: []
    });
    setPlaylistFormErrors({});
    setCurrentView("playlistList");
  } catch (error) {
    console.error("Error saving playlist:", error);
    alert("There was a problem saving the playlist.");
  }
};


  // Manejar eliminación de video
  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to delete video");
  
      // Eliminar video del estado local
      setVideos(videos.filter((v) => v._id !== videoId));
  
      // Eliminar video de todas las playlists que lo contienen
      const updatedPlaylists = playlists.map((playlist) => ({
        ...playlist,
        videos: playlist.videos.filter((id) => id !== videoId),
      }));
      setPlaylists(updatedPlaylists);
  
      // Si estamos en detalle de playlist, actualizar la playlist seleccionada
      if (selectedPlaylist) {
        setSelectedPlaylist({
          ...selectedPlaylist,
          videos: selectedPlaylist.videos.filter((id) => id !== videoId),
        });
      }
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Error deleting video. Please try again.");
    }
  };

  // Manejar eliminación de playlist
  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm("Are you sure you want to delete this playlist?")) return;
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!response.ok) throw new Error("Failed to delete playlist");
  
      // Actualizar estado local
      setPlaylists(playlists.filter((p) => p._id !== playlistId));
  
      // Si estamos viendo esa playlist, salimos del detalle
      if (selectedPlaylist && selectedPlaylist._id === playlistId) {
        setSelectedPlaylist(null);
        setCurrentView("playlistList");
      }
  
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Error deleting playlist. Please try again.");
    }
  };
  

  // Manejar edición de video
  const handleEditVideo = (video) => {
    setVideoForm({
      id: video._id, // <- importante
      name: video.name,
      url: video.url,
      description: video.description,
      thumbnail: video.thumbnail
    });
    setCurrentView("addVideo");
  };
  

  // Manejar edición de playlist
  const handleEditPlaylist = (playlist) => {
    setPlaylistForm({
      id: playlist._id,
      name: playlist.name,
      description: playlist.description,
      assignedProfiles: playlist.assignedProfiles,
      videos: playlist.videos
    });
    setCurrentView("addPlaylist");
  };

  // Manejar selección de playlist
  const handleSelectPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setCurrentView("playlistDetail");
  };

  // Manejar agregar video a playlist
  const handleAddVideoToPlaylist = async (videoId) => {
    if (!selectedPlaylist.videos.includes(videoId)) {
      const updatedPlaylist = {
        ...selectedPlaylist,
        videos: [...selectedPlaylist.videos, videoId]
      };
  
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/playlists/${selectedPlaylist._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedPlaylist)
        });
  
        if (!response.ok) throw new Error("Failed to update playlist");
  
        const updatedFromServer = await response.json();
  
        // Actualizar estado local
        setSelectedPlaylist(updatedFromServer);
        setPlaylists(playlists.map(p => p._id === updatedFromServer._id ? updatedFromServer : p));
      } catch (error) {
        console.error("Error adding video to playlist:", error);
      }
    }
  };
  
  // Manejar quitar video de playlist
  const handleRemoveVideoFromPlaylist = async (videoId) => {
    const updatedPlaylist = {
      ...selectedPlaylist,
      videos: selectedPlaylist.videos.filter(id => id !== videoId)
    };
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/playlists/${selectedPlaylist._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedPlaylist)
      });
  
      if (!response.ok) throw new Error("Failed to update playlist");
  
      const updatedFromServer = await response.json();
  
      // Actualizar estado local
      setSelectedPlaylist(updatedFromServer);
      setPlaylists(playlists.map(p => p._id === updatedFromServer._id ? updatedFromServer : p));
    } catch (error) {
      console.error("Error removing video from playlist:", error);
    }
  };
  

  // Manejar cambio en checkbox de perfil para playlist
  const handleProfileCheckboxChange = (profileId) => {
    const updatedProfiles = playlistForm.assignedProfiles.includes(profileId)
      ? playlistForm.assignedProfiles.filter(id => id !== profileId)
      : [...playlistForm.assignedProfiles, profileId];

    setPlaylistForm({
      ...playlistForm,
      assignedProfiles: updatedProfiles
    });
  };

  // Handle back to profiles
  const handleBackToProfiles = () => {
    // Store admin authentication state in localStorage
    localStorage.setItem('adminAuthenticated', 'true');
    navigate("/profile-selector");
  };

  // Handle back to user management
  const handleGoToUserManagement = () => {
    // Store admin authentication state and user management flag in localStorage
    localStorage.setItem('adminAuthenticated', 'true');
    localStorage.setItem('showUserManagement', 'true');
    navigate("/profile-selector");
  };

  // Renderizar vista de dashboard
  const renderDashboard = () => (
    <div className="video-management-content">
      <div className="management-cards">
        <div className="management-card">
          <div className="card-icon">📹</div>
          <h3>Add Video</h3>
          <p>Add new videos to the library</p>
          <button
            className="card-action-btn"
            onClick={() => {
              setVideoForm({
                id: null,
                name: "",
                url: "",
                description: "",
                thumbnail: ""
              });
              setCurrentView("addVideo");
            }}
          >
            Add Video
          </button>
        </div>

        <div className="management-card">
          <div className="card-icon">🎬</div>
          <h3>Manage Videos</h3>
          <p>Edit or delete existing videos</p>
          <button
            className="card-action-btn"
            onClick={() => setCurrentView("videoList")}
          >
            View Videos ({videos.length})
          </button>
        </div>

        <div className="management-card">
          <div className="card-icon">🎵</div>
          <h3>Create Playlist</h3>
          <p>Create new playlists for users</p>
          <button
            className="card-action-btn"
            onClick={() => {
              setPlaylistForm({
                id: null,
                name: "",
                description: "",
                assignedProfiles: [],
                videos: []
              });
              setCurrentView("addPlaylist");
            }}
          >
            New Playlist
          </button>
        </div>

        <div className="management-card">
          <div className="card-icon">📋</div>
          <h3>Manage Playlists</h3>
          <p>Edit or delete existing playlists</p>
          <button
            className="card-action-btn"
            onClick={() => setCurrentView("playlistList")}
          >
            View Playlists ({playlists.length})
          </button>
        </div>
      </div>
    </div>
  );

  // Renderizar lista de videos
  const renderVideoList = () => (
    <div className="video-list-container">
      <div className="section-header">
        <h3>All Videos ({videos.length})</h3>
        <button
          className="add-btn"
          onClick={() => {
            setVideoForm({
              id: null,
              name: "",
              url: "",
              description: "",
              thumbnail: ""
            });
            setCurrentView("addVideo");
          }}
        >
          + Add New Video
        </button>
      </div>

      {videos.length > 0 ? (
        <div className="video-grid">
          {videos.map(video => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <img src={video.thumbnail || "/placeholder.svg"} alt={video.name} />
              </div>
              <div className="video-info">
                <h4>{video.name}</h4>
                <p className="video-description">{video.description}</p>
              </div>
              <div className="video-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditVideo(video)}
                >
                  ✎ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteVideo(video._id)}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No videos added yet. Click "Add New Video" to create your first video.</p>
        </div>
      )}

      <button
        className="back-btn secondary-back"
        onClick={() => setCurrentView("dashboard")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  // Renderizar lista de playlists
  const renderPlaylistList = () => (
    <div className="playlist-list-container">
      <div className="section-header">
        <h3>All Playlists ({playlists.length})</h3>
        <button
          className="add-btn"
          onClick={() => {
            setPlaylistForm({
              id: null,
              name: "",
              description: "",
              assignedProfiles: [],
              videos: []
            });
            setCurrentView("addPlaylist");
          }}
        >
          + Add New Playlist
        </button>
      </div>

      {playlists.length > 0 ? (
        <div className="playlist-grid">
          {playlists.map(playlist => (
            <div key={playlist.id} className="playlist-card">
              <div className="playlist-info" onClick={() => handleSelectPlaylist(playlist)}>
                <h4>{playlist.name}</h4>
                <p className="playlist-description">{playlist.description}</p>
                <div className="playlist-meta">
                  <span className="video-count">{playlist.videos.length} videos</span>
                  <span className="profile-count">
                    {playlist.assignedProfiles.length} {playlist.assignedProfiles.length === 1 ? 'profile' : 'profiles'}
                  </span>
                </div>
                <div className="playlist-profiles">
                  {playlist.assignedProfiles.map(profileId => {
                    const profile = profiles.find(p => p.id === profileId);
                    return profile ? (
                      <div key={profileId} className="mini-profile">
                        <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="playlist-actions">
                <button
                  className="view-btn"
                  onClick={() => handleSelectPlaylist(playlist)}
                >
                  👁️ View
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEditPlaylist(playlist)}
                >
                  ✎ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePlaylist(playlist._id)}
                >
                  ✕ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No playlists created yet. Click "Add New Playlist" to create your first playlist.</p>
        </div>
      )}

      <button
        className="back-btn secondary-back"
        onClick={() => setCurrentView("dashboard")}
      >
        ← Back to Dashboard
      </button>
    </div>
  );

  // Renderizar formulario de video
  const renderVideoForm = () => (
    <div className="form-container">
      <h3>{videoForm.id ? "Edit Video" : "Add New Video"}</h3>

      <form onSubmit={handleVideoSubmit} className="video-form">
        <div className="form-group">
          <label htmlFor="video-name">Video Name *</label>
          <input
            id="video-name"
            type="text"
            value={videoForm.name}
            onChange={(e) => setVideoForm({ ...videoForm, name: e.target.value })}
            placeholder="Enter video name"
          />
          {videoFormErrors.name && <div className="validation-error">{videoFormErrors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="video-url">YouTube URL *</label>
          <input
            id="video-url"
            type="text"
            value={videoForm.url}
            onChange={(e) => setVideoForm({ ...videoForm, url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {videoFormErrors.url && <div className="validation-error">{videoFormErrors.url}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="video-description">Description</label>
          <textarea
            id="video-description"
            value={videoForm.description}
            onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
            placeholder="Enter video description"
            rows={4}
          />
        </div>

        {videoForm.url && getYoutubeId(videoForm.url) && (
          <div className="form-group">
            <label>Preview Thumbnail</label>
            <div className="thumbnail-preview">
              <img src={getYoutubeThumbnail(videoForm.url) || "/placeholder.svg"} alt="Video thumbnail" />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setVideoForm({
                id: null,
                name: "",
                url: "",
                description: "",
                thumbnail: ""
              });
              setVideoFormErrors({});
              setCurrentView(selectedPlaylist ? "playlistDetail" : "videoList");
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
          >
            {videoForm.id ? "Update Video" : "Add Video"}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar formulario de playlist
  const renderPlaylistForm = () => (
    <div className="form-container">
      <h3>{playlistForm.id ? "Edit Playlist" : "Create New Playlist"}</h3>

      <form onSubmit={handlePlaylistSubmit} className="playlist-form">
        <div className="form-group">
          <label htmlFor="playlist-name">Playlist Name *</label>
          <input
            id="playlist-name"
            type="text"
            value={playlistForm.name}
            onChange={(e) => setPlaylistForm({ ...playlistForm, name: e.target.value })}
            placeholder="Enter playlist name"
          />
          {playlistFormErrors.name && <div className="validation-error">{playlistFormErrors.name}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="playlist-description">Description</label>
          <textarea
            id="playlist-description"
            value={playlistForm.description}
            onChange={(e) => setPlaylistForm({ ...playlistForm, description: e.target.value })}
            placeholder="Enter playlist description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Assign to Profiles *</label>
          <div className="profile-selection">
            {profiles.map(profile => (
              <div key={profile.id} className="profile-checkbox">
                <input
                  type="checkbox"
                  id={`profile-${profile.id}`}
                  checked={playlistForm.assignedProfiles.includes(profile.id)}
                  onChange={() => handleProfileCheckboxChange(profile.id)}
                />
                <label htmlFor={`profile-${profile.id}`} className="profile-label">
                  <div className="mini-profile">
                    <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                  </div>
                  <span>{profile.name}</span>
                </label>
              </div>
            ))}
          </div>
          {playlistFormErrors.assignedProfiles && (
            <div className="validation-error">{playlistFormErrors.assignedProfiles}</div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setPlaylistForm({
                id: null,
                name: "",
                description: "",
                assignedProfiles: [],
                videos: []
              });
              setPlaylistFormErrors({});
              setCurrentView("playlistList");
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
          >
            {playlistForm.id ? "Update Playlist" : "Create Playlist"}
          </button>
        </div>
      </form>
    </div>
  );

  // Renderizar detalle de playlist
  const renderPlaylistDetail = () => {
    if (!selectedPlaylist) return null;

    const playlistVideos = videos.filter(video => selectedPlaylist.videos.includes(video._id));
    const availableVideos = videos.filter(video => !selectedPlaylist.videos.includes(video._id));

    return (
      <div className="playlist-detail-container">
        <div className="playlist-header">
          <h3>{selectedPlaylist.name}</h3>
          <p className="playlist-description">{selectedPlaylist.description}</p>

          <div className="playlist-meta">
            <div className="assigned-profiles">
              <span>Assigned to: </span>
              {selectedPlaylist.assignedProfiles.map(profileId => {
                const profile = profiles.find(p => p.id === profileId);
                return profile ? (
                  <div key={profileId} className="mini-profile">
                    <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    <span>{profile.name}</span>
                  </div>
                ) : null;
              })}
            </div>

            <button
              className="edit-playlist-btn"
              onClick={() => handleEditPlaylist(selectedPlaylist)}
            >
              ✎ Edit Playlist
            </button>
          </div>
        </div>

        <div className="playlist-videos-section">
          <div className="section-header">
            <h4>Videos in this Playlist ({playlistVideos.length})</h4>
          </div>

          {playlistVideos.length > 0 ? (
            <div className="video-grid">
              {playlistVideos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail">
                    <img src={video.thumbnail || "/placeholder.svg"} alt={video.name} />
                  </div>
                  <div className="video-info">
                    <h4>{video.name}</h4>
                    <p className="video-description">{video.description}</p>
                  </div>
                  <div className="video-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditVideo(video)}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveVideoFromPlaylist(video._id)}
                    >
                      ↩ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No videos in this playlist yet. Add videos from the library below.</p>
            </div>
          )}
        </div>

        <div className="available-videos-section">
          <div className="section-header">
            <h4>Available Videos ({availableVideos.length})</h4>
            <button
              className="add-btn"
              onClick={() => {
                setVideoForm({
                  id: null,
                  name: "",
                  url: "",
                  description: "",
                  thumbnail: ""
                });
                setCurrentView("addVideo");
              }}
            >
              + Add New Video
            </button>
          </div>

          {availableVideos.length > 0 ? (
            <div className="video-grid">
              {availableVideos.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumbnail">
                    <img src={video.thumbnail || "/placeholder.svg"} alt={video.name} />
                  </div>
                  <div className="video-info">
                    <h4>{video.name}</h4>
                    <p className="video-description">{video.description}</p>
                  </div>
                  <div className="video-actions">
                    <button
                      className="add-to-playlist-btn"
                      onClick={() => handleAddVideoToPlaylist(video._id)}
                    >
                      + Add to Playlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No more videos available. Create new videos to add to this playlist.</p>
            </div>
          )}
        </div>

        <button
          className="back-btn secondary-back"
          onClick={() => {
            setSelectedPlaylist(null);
            setCurrentView("playlistList");
          }}
        >
          ← Back to Playlists
        </button>
      </div>
    );
  };

  // Renderizar contenido principal basado en la vista actual
  const renderContent = () => {
    switch (currentView) {
      case "videoList":
        return renderVideoList();
      case "playlistList":
        return renderPlaylistList();
      case "addVideo":
        return renderVideoForm();
      case "addPlaylist":
        return renderPlaylistForm();
      case "playlistDetail":
        return renderPlaylistDetail();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="tube-kids-app">
      <div className="tube-kids-container">
        <header className="tube-kids-header">
          <div className="tube-kids-logo">
            <h1>TubeKids</h1>
          </div>
          <div className="tube-kids-user">
            <span className="user-email">{userEmail}</span>
            <div className="user-avatar">
              <img src={icon || "/placeholder.svg"} alt="User" />
            </div>
          </div>
        </header>

        <main className="tube-kids-content">
          <div className="video-management-section">
            <h2 className="section-title">Video Management</h2>

            <div className="admin-tabs">
              <button
                className="admin-tab active"
              >
                Manage Videos
              </button>
              <button
                className="admin-tab"
                onClick={handleGoToUserManagement}
              >
                Manage Restricted Users
              </button>
            </div>

            <div className="admin-description">
              <p>Manage videos and playlists available for restricted users.</p>
            </div>

            {renderContent()}

            {currentView === "dashboard" && (
              <button className="back-btn" onClick={handleBackToProfiles}>
                ← Back to Profile Selection
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default VideoManagement;