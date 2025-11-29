import { SignedIn, SignedOut, UserButton, SignIn } from "@clerk/clerk-react";

export default function SignInPage() {
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Hello there</h1>
          <p className="py-6">Sign in to get started!</p>{" "}
          <SignedOut>
            <SignIn withSignUp="false" forceRedirectUrl={"/users"} />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
