import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Lobby from '../pages/Lobby';
import Game from '../pages/Game';
import Rules from '../pages/Rules';
import NotFound from '../pages/NotFound';
import OfflineSetup from '../pages/OfflineSetup';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/" element={<Home />} />
        <Route path="/offline-setup" element={<OfflineSetup />} />
        <Route path="/lobby" element={<Lobby />} />
        {/* This route handles both online (with roomId) and offline modes */}
        <Route path="/game/offline" element={<Game />} />
        <Route path="/game/:roomId" element={<Game />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;