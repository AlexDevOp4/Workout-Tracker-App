import React from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

export default function NavBar() {
  return (
    <nav className="navbar bg-base-100 shadow-sm flex flex-row">
      <SignedIn>
        <UserButton />
      </SignedIn>
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
  );
}
