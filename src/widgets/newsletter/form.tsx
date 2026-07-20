"use client";

import { useState } from "react";

type Props = {
  submitLabel: string;
};

const NewsletterFormClient = ({ submitLabel }: Props) => {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    setStatus("pending");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p role="status" className="text-center font-medium">
        Thanks for subscribing. Please check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="pp-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="pp-newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full flex-1 rounded-[var(--pp-radius-md)] border border-[var(--pp-c-border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--pp-c-primary)]"
        />
        <button
          type="submit"
          disabled={status === "pending"}
          className="pp-btn-primary inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === "pending" ? "Subscribing..." : submitLabel}
        </button>
      </div>
      {status === "error" ? (
        <p role="alert" className="mt-3 text-center text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
};

export default NewsletterFormClient;
