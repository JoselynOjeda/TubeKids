import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthenticationComponent from './Components/AuthenticationComponent';
import ProfileSelector from './Components/Tube/Profile-Selector'; // Ensure this import is correct
import Playlist from "./Components/Tube/Playlist";
import VideoManagement from "./Components/Tube/VideoManagement";
import CompleteProfile from "./Components/Google/CompleteProfile";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<AuthenticationComponent />} />
                    <Route path="/profile-selector" element={<ProfileSelector />} />
                    <Route path="/playlist" element={<Playlist />} />
                    <Route path="/video-management" element={<VideoManagement />} />
                    <Route path="/complete-profile" element={<CompleteProfile />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
