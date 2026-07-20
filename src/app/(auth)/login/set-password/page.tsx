import { Suspense } from "react";
import SetPasswordForm from "@/components/studio/auth/set-password-form";

const SetPasswordPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-app px-4">
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-ink">Set your password</h1>
        <p className="mt-1 text-sm text-muted">Finish setting up your PagePilot account</p>
      </div>
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </div>
  </div>
);

export default SetPasswordPage;
