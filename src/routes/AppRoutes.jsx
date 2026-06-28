import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Lobby from '../pages/Lobby';
import Game from '../pages/Game';
import Rules from '../pages/Rules';
import NotFound from '../pages/NotFound';

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="lobby" element={<Lobby />} />
          <Route path="game/:roomId" element={<Game />} />
          <Route path="rules" element={<Rules />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;