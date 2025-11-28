import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import UsersPage from './pages/Users/UsersPage';
import ClientsPage from './pages/Clients/ClientsPage';
import TrainerPage from './pages/Trainer/TrainerPage';
import ClientPage from './pages/Client/ClientPage';
// import ProgramsPage from './pages/Programs/ProgramsPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar bg-base-100 shadow-sm flex flex-row">
        <Link className="btn btn-ghost text-xl" to="/users">
          Users
        </Link>{" "}
        |{" "}
        <Link className="btn btn-ghost text-xl" to="/clients">
          Clients
        </Link>{" "}
        |{" "}
        <Link className="btn btn-ghost text-xl" to="/programs">
          Programs
        </Link>
      </nav>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route
          path="/client/:clientId/trainer/:trainerId"
          element={<ClientPage />}
        />
        <Route path="/trainer/:id" element={<TrainerPage />} />
        {/* <Route path="/programs" element={<ProgramsPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
