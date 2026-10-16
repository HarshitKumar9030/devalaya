"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Heart, ShieldCheck, X } from "lucide-react";
import { useSessionGuard } from "./auth/session-provider";
import { CustomSelect, DateInput, NumberInput } from "./ui/form-controls";
import { temples, type Temple } from "@/lib/temples";
import { useUser } from "@clerk/nextjs";
import { TextInput } from "./ui/form-controls";

export type Transaction = { kind: "booking" | "donation"; temple: Temple };
export function TransactionDialog({
  transaction,
  closing,
  close,
  onTempleChange,
}: {
  transaction: Transaction;
  closing: boolean;
  close: () => void;
  onTempleChange: (temple: Temple) => void;
}) {
  const session = useSessionGuard();
  return session.isSignedIn ? (
    <TransactionForm
      key={session.userId}
      transaction={transaction}
      closing={closing}
      close={close}
      onTempleChange={onTempleChange}
    />
  ) : null;
}

function TransactionForm({
  transaction,
  closing,
  close,
  onTempleChange,
}: {
  transaction: Transaction;
  closing: boolean;
  close: () => void;
  onTempleChange: (temple: Temple) => void;
}) {
  const { user } = useUser();
  const [holderName, setHolderName] = useState(user?.fullName ?? "");
  const dialog = useRef<HTMLDialogElement>(null);
  const session = useSessionGuard();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("07:00");
  const [people, setPeople] = useState(1);
  const [amount, setAmount] = useState(501);
  const [cause, setCause] = useState("Temple upkeep");
  const [message, setMessage] = useState("");
  const [dateError, setDateError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      request.current?.abort();
      previous?.focus();
    };
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (loading || saved) return;
    if (!date && transaction.kind === "booking") {
      setDateError("Choose a day for your visit.");
      return;
    }
    setLoading(true);
    setMessage("");
    request.current = new AbortController();
    try {
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: request.current.signal,
        body: JSON.stringify(
          transaction.kind === "booking"
            ? {
                kind: "booking",
                templeId: transaction.temple.id,
                holderName,
                date,
                time,
                people,
              }
            : {
                kind: "donation",
                templeId: transaction.temple.id,
                amount,
                cause,
              },
        ),
      });
      const result = await response.json();
      if (response.status === 401) {
        close();
        session.signIn();
        return;
      }
      setMessage(result.message || result.error);
      if (response.ok) setSaved(true);
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        setMessage("We couldn’t reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      aria-label={
        transaction.kind === "booking" ? "Plan your darshan" : "Temple donation"
      }
      className={`modal transaction-dialog t-modal ${closing ? "is-closing" : "is-open"}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
    >
      <div className="modal-content">
        <button
          className="modal-close"
          aria-label="Close dialog"
          onClick={close}
        >
          <X size={20} />
        </button>
        <span className="transaction-icon">
          {transaction.kind === "booking" ? (
            <ShieldCheck size={25} />
          ) : (
            <Heart size={25} />
          )}
        </span>
        <h2>
          {transaction.kind === "booking"
            ? "Make time for the divine."
            : "A little kindness goes far."}
        </h2>
        <p>
          {transaction.kind === "booking"
            ? transaction.temple.name
            : "Choose one temple and a cause close to your heart."}
        </p>
        {saved ? (
          <div className="transaction-success">
            <span>
              <Check size={27} />
            </span>
            <h3>A meaningful step.</h3>
            <p role="status">{message}</p>
            <Link href="/account/bookings" className="button primary full">
              Go to your dashboard
              <ArrowRight size={16} />
            </Link>
            <button className="text-link" onClick={close}>
              Keep exploring
            </button>
          </div>
        ) : (
          <form className="transaction-form" onSubmit={submit}>
            <fieldset disabled={loading} className="transaction-fields">
              {transaction.kind === "donation" ? (
                <>
                  <CustomSelect
                    label="Your temple"
                    name="temple"
                    value={transaction.temple.id}
                    onValueChange={(id) =>
                      onTempleChange(temples.find((t) => t.id === id)!)
                    }
                    options={temples.map((t) => ({
                      value: t.id,
                      label: t.name,
                      description: t.place,
                    }))}
                  />
                  <CustomSelect
                    label="Your intention"
                    name="cause"
                    value={cause}
                    onValueChange={setCause}
                    options={[
                      "Temple upkeep",
                      "Community meals",
                      "Local family essentials",
                    ].map((value) => ({ value, label: value }))}
                  />
                  <NumberInput
                    label="Donation amount (₹)"
                    value={amount}
                    onValueChange={setAmount}
                    prefix="₹"
                  />
                  <div className="amount-options">
                    {[101, 501, 1001, 2100].map((a) => (
                      <button
                        type="button"
                        key={a}
                        aria-pressed={amount === a}
                        className={amount === a ? "selected" : ""}
                        onClick={() => setAmount(a)}
                      >
                        ₹{a.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <p className="privacy-note">
                    <ShieldCheck size={16} />
                    Only {transaction.temple.name} manages this donation. Funds
                    are never pooled across temples.
                  </p>
                </>
              ) : (
                <>
                  <TextInput
                    label="Ticket on name"
                    name="holderName"
                    autoComplete="name"
                    placeholder="Full name of the lead devotee"
                    required
                    minLength={2}
                    maxLength={100}
                    value={holderName}
                    onChange={(event) => setHolderName(event.target.value)}
                  />
                  <DateInput
                    label="Date of visit"
                    min={new Date().toLocaleDateString("en-CA", {
                      timeZone: "Asia/Kolkata",
                    })}
                    value={date}
                    onValueChange={(value) => {
                      setDate(value);
                      setDateError("");
                    }}
                    error={dateError}
                  />
                  <div className="form-row">
                    <CustomSelect
                      label="Preferred time"
                      name="time"
                      value={time}
                      onValueChange={setTime}
                      options={[
                        "07:00",
                        "09:00",
                        "11:00",
                        "15:00",
                        "17:00",
                      ].map((value) => ({ value, label: formatTime(value) }))}
                    />
                    <NumberInput
                      label="Devotees"
                      value={people}
                      onValueChange={setPeople}
                      max={10}
                    />
                  </div>
                  <div className="booking-summary">
                    <span>Illustrative darshan total</span>
                    <strong>
                      {transaction.temple.price
                        ? `₹${(transaction.temple.price * people).toLocaleString("en-IN")}`
                        : "Free darshan"}
                    </strong>
                  </div>
                  <p className="privacy-note">
                    This is a visit request. Temple availability must be
                    confirmed before an entry pass can be issued.
                  </p>
                </>
              )}
            </fieldset>
            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}
            <button
              className="button primary full"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving securely…"
                : transaction.kind === "booking"
                  ? "Request this visit"
                  : "Save donation intention"}
              <ArrowRight size={16} />
            </button>
            <small className="no-charge">
              <ShieldCheck size={12} />
              Signed in securely. No payment collected.
            </small>
          </form>
        )}
      </div>
    </dialog>
  );
}

function formatTime(value: string) {
  const hour = Number(value.slice(0, 2));
  return `${hour % 12 || 12}:00 ${hour < 12 ? "AM" : "PM"}`;
}
