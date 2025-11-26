import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import UsersPage from './pages/Users/UsersPage';
import ClientsPage from './pages/Clients/ClientsPage';
import TrainerPage from './pages/Trainer/TrainerPage';
// import ProgramsPage from './pages/Programs/ProgramsPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 border-b">
        <Link to="/users">Users</Link> |{' '}
        <Link to="/clients">Clients</Link> |{' '}
        <Link to="/programs">Programs</Link>
      </nav>
      <Routes>
        <Route path="/users" element={<UsersPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path='/trainer/:id' element={<TrainerPage/>}/>
        {/* <Route path="/programs" element={<ProgramsPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
