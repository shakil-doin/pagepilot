import { Suspense } from "react";
import LoginForm from "@/components/studio/auth/login-form";

const LoginPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-app px-4">
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-xl font-bold text-white">
          P
        </div>
        <h1 className="text-xl font-semibold text-ink">PagePilot Studio</h1>
        <p className="mt-1 text-sm text-muted">Sign in to manage your site</p>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  </div>
);

export default LoginPage;
