import { useState } from "react";
import { toast } from "sonner";

export default function MailtrapTester() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Test from Infinite Notes");
  const [html, setHtml] = useState("<h1>مرحبا</h1><p>هذا اختبار من Mailtrap.</p>");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/email/send-mailtrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to, subject, html }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Send failed");
      }

      toast.success("Email sent via Mailtrap");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="mt-8 rounded-xl p-5 gradient-card-bg space-y-3"
      style={{ border: "1px solid var(--border)" }}
    >
      <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
        Mailtrap test send
      </h2>
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        From: no-reply@note.misruq.com — تأكد أن الدومين Verified في Mailtrap.
      </p>
      <input
        type="email"
        required
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="recipient@example.com"
        className="w-full h-10 px-3 rounded-lg text-sm outline-none"
        style={{ backgroundColor: "var(--ink)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
      />
      <input
        type="text"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full h-10 px-3 rounded-lg text-sm outline-none"
        style={{ backgroundColor: "var(--ink)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
      />
      <textarea
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 rounded-lg text-sm outline-none font-mono"
        style={{ backgroundColor: "var(--ink)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
      />
      <button
        type="submit"
        disabled={loading}
        className="h-10 px-5 rounded-lg text-sm font-semibold text-white animated-gradient gradient-hero disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send test email"}
      </button>
    </form>
  );
}
