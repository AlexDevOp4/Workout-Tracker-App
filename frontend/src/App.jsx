import { Routes, Route, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import NavBar from "./components/navbar/Navbar";
import UsersPage from "./pages/Users/UsersPage";
import ClientsPage from "./pages/Clients/ClientsPage";
import TrainerPage from "./pages/Trainer/TrainerPage";
import ClientPage from "./pages/Client/ClientPage";
import SignIn from "./pages/signIn/SignIn";

// import ProgramsPage from './pages/Programs/ProgramsPage';

export default function App() {
  return (
    <>
      <SignedIn>
        <NavBar />
      </SignedIn>

      <Routes>
        <Route
          path="/sign-in"
          element={
            <SignedOut>
              <SignIn />
            </SignedOut>
          }
        />

        <Route
          path="/users"
          element={
            <SignedIn>
              <UsersPage />
            </SignedIn>
          }
        />

        <Route
          path="/clients"
          element={
            <SignedIn>
              <ClientsPage />
            </SignedIn>
          }
        />

        <Route
          path="/client/:clientId/trainer/:trainerId"
          element={
            <SignedIn>
              <ClientPage />
            </SignedIn>
          }
        />

        <Route
          path="/trainer/:id"
          element={
            <SignedIn>
              <TrainerPage />
            </SignedIn>
          }
        />

        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Navigate to="/users" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </>
  );
}
