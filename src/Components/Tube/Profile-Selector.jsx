import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { decodeToken, isAdmin } from '../../utilities/authUtils';
import "./TubeKids.css";
import axios from 'axios';
import Swal from 'sweetalert2';

// Importaciones de imágenes (usando placeholders para evitar errores)
import icon1 from "../../assets/icon1.jpg";
import icon2 from "../../assets/icon2.jpg";
import icon3 from "../../assets/icon3.jpg";
import icon4 from "../../assets/icon4.jpg";
import icon5 from "../../assets/icon5.jpg";
import icon6 from "../../assets/icon6.jpg";
import icon from "../../assets/iconpf.jpg";

const API_URL = "http://localhost:5000/api/restricted-users";

const TubeKids = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [newProfile, setNewProfile] = useState({ name: "", pin: "", avatar: "" });


  const user = decodeToken();
  console.log("Decoded Token:", user);
  const userEmail = user?.email
  const userName = user?.name;
  const userPin = user?.pin;

  const fetchProfiles = async () => {
    const token = localStorage.getItem('token');  // Ensure the token is being saved in localStorage upon login
    console.log(`Token being sent: ${token}`); // This will log the token you're sending
    const headers = {
      Authorization: `Bearer ${token}`
    };

    try {
      const response = await axios.get(API_URL, { headers });
      console.log('Response Data:', response.data); // This logs the response from the server
      setProfiles(response.data);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error("Error fetching profiles:", errorMessage);
      Swal.fire('Error!', errorMessage, 'error');
    }
  };

  useEffect(() => {
    fetchProfiles();

    const shouldShowUserManagement = localStorage.getItem('showUserManagement');
    if (shouldShowUserManagement === 'true') {
      setCurrentScreen('userManagement');
      localStorage.removeItem('showUserManagement'); // Limpiamos la bandera después de usarla
    }
  }, []);

  // State para control de UI
  const [isAddProfileOpen, setIsAddProfileOpen] = useState(false);
  const [isViewProfileOpen, setIsViewProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("profileSelection"); // profileSelection, userManagement

  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [enteredPin, setEnteredPin] = useState("");

  const MAX_PROFILES = 6;


  // Avatares predefinidos
  const avatarOptions = [
    { id: "avatar1", src: icon1, alt: "Avatar 1" },
    { id: "avatar2", src: icon2, alt: "Avatar 2" },
    { id: "avatar3", src: icon3, alt: "Avatar 3" },
    { id: "avatar4", src: icon4, alt: "Avatar 4" },
    { id: "avatar5", src: icon5, alt: "Avatar 5" },
    { id: "avatar6", src: icon6, alt: "Avatar 6" },
  ];

  // Manejar la adición de un nuevo perfil
  const handleAddProfile = async () => {
    if (!newProfile.name || !newProfile.pin || newProfile.pin.length !== 6 || !selectedAvatar) {
      alert("Please ensure all fields are filled correctly.");
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const profileData = {
      name: newProfile.name,
      pin: newProfile.pin,
      avatar: selectedAvatar,
    };

    try {
      const response = await axios.post(API_URL, profileData, { headers });

      setProfiles([...profiles, response.data]);
      setNewProfile({ name: "", pin: "", avatar: "" });
      setSelectedAvatar("");

      // ✅ Cierra el modal de agregar
      setIsAddProfileOpen(false);

      // (Opcional) Mostrar mensaje de éxito
      Swal.fire('Success!', 'Profile created successfully.', 'success');
    } catch (error) {
      console.error("Error adding profile:", error);
      Swal.fire('Error!', error.message || 'Could not add profile.', 'error');
    }
  };


  // Manejar la selección de un perfil
  const handleSelectProfile = (profile) => {
    setCurrentProfile(profile);
    setIsPinModalOpen(true);
  };

  // Manejar la visualización de un perfil (acción de administrador)
  const handleViewProfile = (profile) => {
    setCurrentProfile(profile);
    setIsViewProfileOpen(true);
  };

  // Manejar la edición de un perfil
  const handleEditProfile = (profile) => {
    setCurrentProfile(profile);
    setNewProfile({
      name: profile.name,
      pin: profile.pin
    });
    setSelectedAvatar(profile.avatar);
    setIsViewProfileOpen(false);
    setIsEditProfileOpen(true);
  };

  // Manejar la actualización de un perfil
  const handleUpdateProfile = async () => {
    if (!newProfile.name || !newProfile.pin || newProfile.pin.length !== 6 || !selectedAvatar) {
      alert("Please ensure all fields are filled correctly.");
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`
    };

    const updatedProfileData = {
      name: newProfile.name,
      pin: newProfile.pin,
      avatar: selectedAvatar, // <- Aquí está el cambio
    };

    try {
      const response = await axios.put(`${API_URL}/${currentProfile._id}`, updatedProfileData, { headers });
      setProfiles(profiles.map(profile => profile._id === currentProfile._id ? response.data : profile));
      setCurrentProfile(null);
      setNewProfile({ name: "", pin: "", avatar: "" });
      setSelectedAvatar("");
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire('Error!', error.message || 'Could not update profile.', 'error');
    }
  };

  // Manejar la confirmación de eliminación
  const handleDeleteConfirm = (profile) => {
    setCurrentProfile(profile);
    setIsDeleteConfirmOpen(true);
  };

  // Manejar la eliminación de un perfil
  const handleDeleteProfile = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error("No token found in localStorage");
      return Swal.fire('Error', 'No authorization token found. Please login again.', 'error');
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    try {
      await axios.delete(`${API_URL}/${currentProfile._id}`, { headers }); // ← aquí se pasa el token
      setProfiles(profiles.filter(profile => profile._id !== currentProfile._id));
      setCurrentProfile(null);
    } catch (error) {
      console.error("Error deleting profile:", error);
      Swal.fire('Error', error.message || 'Could not delete profile.', 'error');
    }
  };

  const handleAdminAccess = () => {
    if (!isAdmin()) {
      Swal.fire("Access Denied", "Only administrators can access this section.", "error");
      return;
    }
    setIsAdminPinModalOpen(true);
  };
  

  // Verificar PIN para acceso al perfil
  const handleVerifyProfilePin = () => {
    if (enteredPin === currentProfile.pin) {
      // Navegar a la página de playlist
      setIsPinModalOpen(false);
      setEnteredPin("");
      navigate("/playlist", { state: { profile: currentProfile } });
    } else {
      alert("Incorrect PIN. Please try again.");
    }
  };

  const handleVerifyAdminPin = () => {
    if (enteredPin === userPin) {
      setIsAdminPinModalOpen(false);
      setEnteredPin("");
      setCurrentScreen("userManagement");
    } else {
      alert("Incorrect admin PIN. Please try again.");
    }
  };

  // Volver a la selección de perfiles
  const handleBackToProfiles = () => {
    setCurrentScreen("profileSelection");
  };

  // Navegar a la página de gestión de videos
  const handleGoToVideoManagement = () => {
    // Establecer localStorage para mantener el estado de autenticación de administrador
    localStorage.setItem('adminAuthenticated', 'true');
    navigate("/video-management");
  };

  // Mostrar confirmación de cierre de sesión
  const handleLogoutConfirm = () => {
    setIsLogoutConfirmOpen(true);
  };

  // Cerrar sesión
  const handleLogout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('showUserManagement');

    // Redirigir a la página de inicio de sesión
    navigate("/");
  };

  // Renderizar la pantalla apropiada basada en el estado currentScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case "userManagement":
        return (
          <div className="user-management-section">
            <h2 className="section-title">Manage Restricted Users</h2>

            <div className="admin-tabs">
              <button
                className="admin-tab"
                onClick={handleGoToVideoManagement}
              >
                Manage Videos
              </button>
              <button
                className="admin-tab active"
              >
                Manage Restricted Users
              </button>
            </div>

            <div className="admin-description">
              <p>Manage restricted user profiles for your children.</p>
              <p>Each profile can access the platform with limited permissions.</p>
            </div>

            {/* Lista de perfiles */}
            <div className="admin-profiles-list">
              <div className="profiles-header">
                <h3>Existing Users ({profiles ? profiles.length : 0} of {MAX_PROFILES})</h3>
                <button
                  className="add-profile-btn"
                  onClick={() => setIsAddProfileOpen(true)}
                  disabled={profiles && profiles.length >= MAX_PROFILES}
                >
                  + Add New
                </button>
              </div>

              {profiles && profiles.length > 0 ? (
                <div className="profiles-table">
                  <div className="profiles-table-header">
                    <div className="profile-col">Avatar</div>
                    <div className="profile-col">Name</div>
                    <div className="profile-col">PIN</div>
                    <div className="profile-col">Actions</div>
                  </div>

                  {profiles.map((profile) => (
                    <div key={profile.id} className="profile-row">
                      <div className="profile-col profile-avatar-col">
                        <div className="profile-avatar-small">
                          <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                        </div>
                      </div>
                      <div className="profile-col profile-name-col">{profile.name}</div>
                      <div className="profile-col profile-pin-col">••••••</div>
                      <div className="profile-col profile-actions-col">
                        <button
                          className="profile-action-btn view-btn"
                          onClick={() => handleViewProfile(profile)}
                          title="View Profile"
                        >
                          ⊙
                        </button>
                        <button
                          className="profile-action-btn edit-btn"
                          onClick={() => handleEditProfile(profile)}
                          title="Edit Profile"
                        >
                          ✎
                        </button>
                        <button
                          className="profile-action-btn delete-btn"
                          onClick={() => handleDeleteConfirm(profile)}
                          title="Delete Profile"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-profiles-message">
                  <p>No profiles created. Click "Add New" to create the first profile.</p>
                </div>
              )}
            </div>

            {profiles && profiles.length >= MAX_PROFILES && (
              <div className="max-profiles-warning">
                <p>You have reached the maximum number of allowed profiles ({MAX_PROFILES}).</p>
              </div>
            )}

            <div className="admin-actions">
              <button className="back-btn" onClick={handleBackToProfiles}>
                ← Back to Profile Selection
              </button>
              <button className="logout-btn" onClick={handleLogoutConfirm}>
                Sign Out
              </button>
            </div>
          </div>
        );

      default: // profileSelection
        return (
          <div className="profile-selector">
            <h2 className="profile-title">Who's watching?</h2>
            <p className="profile-count">
              {profiles ? profiles.length : 0} of {MAX_PROFILES} profiles created
            </p>

            {/* Cuadrícula de perfiles */}
            {profiles && profiles.length > 0 ? (
              <div className="profiles-grid">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="profile-card"
                    onClick={() => handleSelectProfile(profile)}
                  >
                    <div className="profile-avatar">
                      <img src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                    </div>
                    <div className="profile-info">
                      <h3 className="profile-name">{profile.name}</h3>
                      <button className="view-profile-btn">
                        ⟩ Select Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-profiles">
                <p>No profiles yet. Add your first profile to get started!</p>
              </div>
            )}

            {/* Botones de acción */}
            <div className="action-buttons">
              <button
                className="admin-btn"
                onClick={handleAdminAccess}
              >
                ⚙ Administration
              </button>
              <button
                className="logout-btn"
                onClick={handleLogoutConfirm}
              >
                Sign Out
              </button>
            </div>

            <div className="admin-note">
              <p>Click on Administration to manage videos and profiles</p>
              <p>Click on a profile to access its playlist</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="tube-kids-app">
      <div className="tube-kids-container">
        {/* Encabezado con logo e información de usuario */}
        <header className="tube-kids-header">
          <div className="tube-kids-logo">
            <h1>TubeKids</h1>
          </div>
          <div className="tube-kids-user">
            <span className="user-email">{userEmail}</span>
            <div className="user-avatar">
              <img src={icon || "/placeholder.svg"} alt={userName} />
            </div>
          </div>
        </header>

        {/* Contenido principal - renderiza diferentes pantallas basadas en el estado */}
        <main className="tube-kids-content">
          {renderScreen()}
        </main>
      </div>

      {/* Modal de PIN de perfil */}
      {isPinModalOpen && currentProfile && (
        <div className="modal-overlay">
          <div className="modal pin-modal">
            <div className="modal-header">
              <h3>Enter PIN for {currentProfile.name}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setEnteredPin("");
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="pin-entry">
                <div className="selected-profile">
                  <div className="profile-avatar-small">
                    <img src={currentProfile.avatar || "/placeholder.svg"} alt={currentProfile.name} />
                  </div>
                  <h4>{currentProfile.name}</h4>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-pin">Enter 6-digit PIN</label>
                  <input
                    id="profile-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setEnteredPin(value);
                    }}
                    placeholder="Enter PIN"
                    autoFocus
                  />
                </div>


              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsPinModalOpen(false);
                  setEnteredPin("");
                }}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleVerifyProfilePin}
                disabled={!enteredPin || enteredPin.length !== 6}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PIN de administrador */}
      {isAdminPinModalOpen && (
        <div className="modal-overlay">
          <div className="modal pin-modal">
            <div className="modal-header">
              <h3>Enter Administrator PIN</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setIsAdminPinModalOpen(false);
                  setEnteredPin("");
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="pin-entry">
                <div className="selected-profile admin-profile">
                  <div className="profile-avatar-small">
                    <img src={icon || "/placeholder.svg"} alt="Admin" />
                  </div>
                  <h4>Admin: {userName}</h4>
                </div>

                <div className="form-group">
                  <label htmlFor="admin-pin">Enter 6-digit PIN</label>
                  <input
                    id="admin-pin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={enteredPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setEnteredPin(value);
                    }}
                    placeholder="Enter Administrator PIN"
                    autoFocus
                  />
                </div>

              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => {
                  setIsAdminPinModalOpen(false);
                  setEnteredPin("");
                }}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleVerifyAdminPin}
                disabled={!enteredPin || enteredPin.length !== 6}
              >
                Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cierre de sesión */}
      {isLogoutConfirmOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Sign Out</h3>
              <button
                className="close-btn"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="logout-confirmation">
                <p>Are you sure you want to sign out?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsLogoutConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="logout-confirm-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de agregar perfil */}
      {isAddProfileOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Profile</h3>
              <button
                className="close-btn"
                onClick={() => setIsAddProfileOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  value={newProfile.name || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="Enter full name"
                />
                {newProfile.name === "" && <div className="validation-error">Name is required</div>}
              </div>
              <div className="form-group">
                <label htmlFor="pin">PIN * (6 digits)</label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newProfile.pin || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setNewProfile({ ...newProfile, pin: value });
                  }}
                  placeholder="Enter 6-digit PIN"
                />
                {newProfile.pin === "" && <div className="validation-error">PIN is required</div>}
                {newProfile.pin !== "" && newProfile.pin && newProfile.pin.length !== 6 && (
                  <div className="validation-error">PIN must be 6 digits</div>
                )}
              </div>
              <div className="form-group">
                <label>Avatar *</label>
                <div className="avatar-grid">
                  {avatarOptions.map((avatar) => (
                    <div key={avatar.id} className="avatar-option">
                      <input
                        type="radio"
                        name="avatar"
                        id={avatar.id}
                        value={avatar.src}
                        checked={selectedAvatar === avatar.src}
                        onChange={() => setSelectedAvatar(avatar.src)}
                        className="avatar-input"
                      />
                      <label htmlFor={avatar.id} className="avatar-label">
                        <img
                          src={avatar.src || "/placeholder.svg"}
                          alt={avatar.alt}
                          className={selectedAvatar === avatar.src ? "selected" : ""}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                {selectedAvatar === "" && <div className="validation-error">Avatar selection is required</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsAddProfileOpen(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleAddProfile}
                disabled={!newProfile.name || !newProfile.pin || !selectedAvatar || (newProfile.pin && newProfile.pin.length !== 6)}
              >
                Add Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ver perfil */}
      {isViewProfileOpen && currentProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Profile Details</h3>
              <button
                className="close-btn"
                onClick={() => setIsViewProfileOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="profile-details">
                <div className="profile-details-avatar">
                  <img src={currentProfile.avatar || "/placeholder.svg"} alt={currentProfile.name} />
                </div>
                <div className="profile-details-info">
                  <div className="profile-detail">
                    <label>Name:</label>
                    <span>{currentProfile.name}</span>
                  </div>
                  <div className="profile-detail">
                    <label>PIN:</label>
                    <span>••••••</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <div className="action-buttons-row">
                  <button
                    className="profile-action-btn edit-btn"
                    onClick={() => handleEditProfile(currentProfile)}
                    title="Edit Profile"
                  >
                    ✎
                  </button>
                  <button
                    className="profile-action-btn delete-btn"
                    onClick={() => handleDeleteConfirm(currentProfile)}
                    title="Delete Profile"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsViewProfileOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editar perfil */}
      {isEditProfileOpen && currentProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button
                className="close-btn"
                onClick={() => setIsEditProfileOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="edit-name">Full Name *</label>
                <input
                  id="edit-name"
                  type="text"
                  value={newProfile.name || ""}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                  placeholder="Enter full name"
                />
                {newProfile.name === "" && <div className="validation-error">Name is required</div>}
              </div>
              <div className="form-group">
                <label htmlFor="edit-pin">PIN * (6 digits)</label>
                <input
                  id="edit-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={newProfile.pin || ""}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setNewProfile({ ...newProfile, pin: value });
                  }}
                  placeholder="Enter 6-digit PIN"
                />
                {newProfile.pin === "" && <div className="validation-error">PIN is required</div>}
                {newProfile.pin !== "" && newProfile.pin && newProfile.pin.length !== 6 && (
                  <div className="validation-error">PIN must be 6 digits</div>
                )}
              </div>
              <div className="form-group">
                <label>Avatar *</label>
                <div className="avatar-grid">
                  {avatarOptions.map((avatar) => (
                    <div key={avatar.id} className="avatar-option">
                      <input
                        type="radio"
                        name="edit-avatar"
                        id={`edit-${avatar.id}`}
                        value={avatar.src}
                        checked={selectedAvatar === avatar.src}
                        onChange={() => setSelectedAvatar(avatar.src)}
                        className="avatar-input"
                      />
                      <label htmlFor={`edit-${avatar.id}`} className="avatar-label">
                        <img
                          src={avatar.src || "/placeholder.svg"}
                          alt={avatar.alt}
                          className={selectedAvatar === avatar.src ? "selected" : ""}
                        />
                      </label>
                    </div>
                  ))}
                </div>
                {selectedAvatar === "" && <div className="validation-error">Avatar selection is required</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsEditProfileOpen(false)}
              >
                Cancel
              </button>
              <button
                className="submit-btn"
                onClick={handleUpdateProfile}
                disabled={!newProfile.name || !newProfile.pin || !selectedAvatar || (newProfile.pin && newProfile.pin.length !== 6)}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {isDeleteConfirmOpen && currentProfile && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Delete Profile</h3>
              <button
                className="close-btn"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <div className="delete-confirmation">
                <p>Are you sure you want to delete <strong>{currentProfile.name}</strong>'s profile?</p>
                <p className="delete-warning">This action cannot be undone.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="delete-btn"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TubeKids;