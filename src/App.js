import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthenticationComponent from './Components/AuthenticationComponent';
import ProfileSelector from './Components/Tube/Profile-Selector'; // Ensure this import is correct
import Playlist from "./Components/Tube/Playlist";
import VideoManagement from "./Components/Tube/VideoManagement";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<AuthenticationComponent />} />
                    <Route path="/profile-selector" element={<ProfileSelector />} />
                    <Route path="/playlist" element={<Playlist />} />
                    <Route path="/video-management" element={<VideoManagement />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
