"use client";

import { useState } from "react";

type Props = {
  submitLabel: string;
  showPhone: boolean;
  showCompany: boolean;
};

const inputClass =
  "w-full rounded-[var(--pp-radius-md)] border border-[var(--pp-c-border)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[var(--pp-c-primary)]";

const ContactFormClient = ({ submitLabel, showPhone, showCompany }: Props) => {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setStatus("pending");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...values }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p role="status" className="rounded-[var(--pp-radius-md)] border border-[var(--pp-c-border)] p-6 text-center">
        Thanks, your message has been sent. We will get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pp-contact-name" className="mb-1.5 block text-sm font-medium">
          Name
        </label>
        <input id="pp-contact-name" name="name" type="text" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="pp-contact-email" className="mb-1.5 block text-sm font-medium">
          Email
        </label>
        <input id="pp-contact-email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      {showPhone ? (
        <div>
          <label htmlFor="pp-contact-phone" className="mb-1.5 block text-sm font-medium">
            Phone
          </label>
          <input id="pp-contact-phone" name="phone" type="tel" autoComplete="tel" className={inputClass} />
        </div>
      ) : null}
      {showCompany ? (
        <div>
          <label htmlFor="pp-contact-company" className="mb-1.5 block text-sm font-medium">
            Company
          </label>
          <input
            id="pp-contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            className={inputClass}
          />
        </div>
      ) : null}
      <div>
        <label htmlFor="pp-contact-message" className="mb-1.5 block text-sm font-medium">
          Message
        </label>
        <textarea id="pp-contact-message" name="message" required rows={5} className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={status === "pending"}
        className="pp-btn-primary inline-flex w-full items-center justify-center px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "pending" ? "Sending..." : submitLabel}
      </button>
      {status === "error" ? (
        <p role="alert" className="text-sm text-red-600">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
};

export default ContactFormClient;
