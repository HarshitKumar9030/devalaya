"use client";
import Link from "next/link";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Heart,
  LayoutDashboard,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { TicketHolderName } from "./ticket-holder-name";
import { PrivateContent } from "./auth/private-content";
import { TextInput, CustomSelect } from "./ui/form-controls";
import { SacredWorld } from "./sacred-world";
import type { TicketData, GivingData } from "@/lib/tickets";

export function TicketDashboard({
  ownerId,
  ...props
}: {
  ownerId: string;
  tickets: TicketData[];
  giving: GivingData[];
  unavailable: boolean;
}) {
  return (
    <PrivateContent ownerId={ownerId}>
      <DashboardContent key={ownerId} {...props} />
    </PrivateContent>
  );
}

function DashboardContent({
  tickets,
  giving,
  unavailable,
}: {
  tickets: TicketData[];
  giving: GivingData[];
  unavailable: boolean;
}) {
  const { user } = useUser();
  const [tab, setTab] = useState("upcoming");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const upcoming = tickets.filter(
    (t) =>
      t.date >= today && t.status !== "cancelled" && t.status !== "checked-in",
  );
  const past = tickets.filter((t) => !upcoming.includes(t));
  const shown = (tab === "past" ? past : upcoming).filter(
    (t) =>
      (status === "all" || t.status === status) &&
      `${t.temple} ${t.reference} ${t.location} ${t.holderName ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <MotionConfig reducedMotion="user">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <Link className="brand" href="/">
            Devalaya<span className="brand-dot">.</span>
          </Link>
          <span className="sidebar-caption">YOUR LITTLE CORNER</span>
          <nav aria-label="Dashboard navigation">
            <button
              className={tab !== "giving" ? "selected" : ""}
              onClick={() => setTab("upcoming")}
            >
              <LayoutDashboard size={18} />
              My journeys
              <ArrowUpRight size={15} />
            </button>
            <button
              className={tab === "giving" ? "selected" : ""}
              onClick={() => setTab("giving")}
            >
              <Heart size={18} />
              My giving
              <ArrowUpRight size={15} />
            </button>
            <Link href="/#discover">
              <MapPin size={18} />
              Discover temples
              <ArrowUpRight size={15} />
            </Link>
          </nav>
          <div className="sidebar-art">
            <SacredWorld compact variant="mint" />
            <p>
              A little closer to
              <br />
              what matters.
            </p>
          </div>
          <div className="sidebar-account">
            <UserButton />
            <div>
              <strong>{user?.firstName || "Your account"}</strong>
              <span>Signed in securely</span>
            </div>
            <ShieldCheck size={16} />
          </div>
        </aside>
        <main className="dashboard-main">
          <header className="dashboard-topbar">
            <Link href="/" className="text-link">
              <ArrowLeft size={14} />
              Back to discovery
            </Link>
            <span>
              <span className="secure-dot" />
              Your journeys, kept private
            </span>
          </header>
          <div className="dashboard-welcome">
            <div>
              <span className="section-caption">YOUR SACRED JOURNEYS</span>
              <h1>
                {user?.firstName
                  ? `${user.firstName}, make room for meaning.`
                  : "Make room for meaning."}
              </h1>
              <p>
                Little plans. Sacred moments. Everything you need, in one
                peaceful place.
              </p>
            </div>
            <Link href="/#discover" className="button primary">
              Plan a visit
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="dashboard-stats">
            <div>
              <span className="stat-icon blue">
                <Ticket size={21} />
              </span>
              <p>
                <strong>{upcoming.length}</strong>
                <span>Upcoming journeys</span>
              </p>
            </div>
            <div>
              <span className="stat-icon lilac">
                <CalendarDays size={21} />
              </span>
              <p>
                <strong>
                  {tickets.filter((t) => t.status === "pending").length}
                </strong>
                <span>Awaiting confirmation</span>
              </p>
            </div>
            <div>
              <span className="stat-icon mint">
                <Heart size={21} />
              </span>
              <p>
                <strong>{giving.length}</strong>
                <span>Giving intentions</span>
              </p>
            </div>
          </div>
          <div className="dashboard-section-title">
            <h2>
              {tab === "giving"
                ? "Kindness, with intention."
                : "A journey to look forward to."}
            </h2>
            <span>
              {tab === "giving" ? giving.length : tickets.length}{" "}
              {tab === "giving" ? "intentions" : "saved requests"}
            </span>
          </div>
          <div className="dashboard-toolbar">
            <div className="dashboard-tabs" aria-label="Journey category">
              {[
                { value: "upcoming", label: "Upcoming" },
                { value: "past", label: "Past & cancelled" },
                { value: "giving", label: "My giving" },
              ].map((item) => (
                <button
                  key={item.value}
                  aria-pressed={tab === item.value}
                  className={tab === item.value ? "selected" : ""}
                  onClick={() => {
                    setTab(item.value);
                    setStatus("all");
                  }}
                >
                  {tab === item.value && (
                    <motion.span
                      layoutId="dashboard-tab"
                      className="dashboard-tab-highlight"
                    />
                  )}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            {tab !== "giving" && (
              <div className="dashboard-filters">
                <TextInput
                  aria-label="Search your tickets"
                  placeholder="Find a temple or reference…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  icon={<Search size={16} />}
                />
                <CustomSelect
                  compact
                  ariaLabel="Ticket status"
                  value={status}
                  onValueChange={setStatus}
                  options={[
                    { value: "all", label: "All statuses" },
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "checked-in", label: "Checked in" },
                  ]}
                />
              </div>
            )}
          </div>
          {unavailable ? (
            <div className="dashboard-empty" role="status">
              <ShieldCheck size={32} />
              <h3>Your journeys need a moment.</h3>
              <p>
                We couldn’t connect to your saved requests. Try again shortly.
              </p>
              <Link className="button soft" href="/account/bookings">
                Try again
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : tab === "giving" ? (
            <div className="giving-records">
              {giving.length ? (
                giving.map((item) => (
                  <article key={item.id}>
                    <span className="giving-record-icon">
                      <Heart size={21} />
                    </span>
                    <div>
                      <h3>{item.temple}</h3>
                      <p>{item.cause} · Independently managed by this temple</p>
                    </div>
                    <strong>₹{item.amount.toLocaleString("en-IN")}</strong>
                    <span className="ticket-status status-pending">
                      Intention saved
                    </span>
                  </article>
                ))
              ) : (
                <EmptyState kind="giving" />
              )}
            </div>
          ) : shown.length ? (
            <div className="dashboard-ticket-grid">
              {shown.map((ticket, index) => (
                <motion.article
                  key={ticket.id}
                  className={`dashboard-ticket ${ticket.color}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: Math.min(index * 0.06, 0.3),
                  }}
                >
                  <div className="dashboard-ticket-top">
                    <span className={`ticket-status status-${ticket.status}`}>
                      {ticket.status === "pending"
                        ? "Awaiting confirmation"
                        : ticket.status === "checked-in"
                          ? "Checked in"
                          : ticket.status}
                    </span>
                    <span>{ticket.reference}</span>
                  </div>
                  <div className="dashboard-ticket-content">
                    <div className="dashboard-ticket-info">
                      <h3>{ticket.temple}</h3>
                      <TicketHolderName name={ticket.holderName} />
                      <p className="ticket-place">
                        <MapPin size={12} />
                        {ticket.location}
                      </p>
                      <div className="mini-ticket-facts">
                        <span>
                          <CalendarDays size={14} />
                          {ticket.date}
                        </span>
                        <span>
                          <Clock3 size={14} />
                          {ticket.time}
                        </span>
                        <span>
                          <Users size={14} />
                          {ticket.people}{" "}
                          {ticket.people === 1 ? "devotee" : "devotees"}
                        </span>
                      </div>
                    </div>
                    <div className="mini-qr">
                      <img
                        src={`/api/tickets/${ticket.id}/qr`}
                        width="105"
                        height="105"
                        loading="lazy"
                        alt={`Private reference QR for ${ticket.temple}`}
                      />
                      <span>PRIVATE REFERENCE</span>
                    </div>
                  </div>
                  <div className="dashboard-ticket-bottom">
                    <span>
                      {ticket.status === "pending"
                        ? "A request, not an entry pass."
                        : "Keep your visit details close."}
                    </span>
                    <Link href={`/account/tickets/${ticket.id}`}>
                      View{" "}
                      {ticket.status === "confirmed" ? "ticket" : "request"}
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState kind={query || status !== "all" ? "filter" : tab} />
          )}
          <div className="dashboard-footnote">
            <ShieldCheck size={17} />
            <p>
              Your QR codes open account-protected visit records. Pending
              requests need temple confirmation before entry. Giving intentions
              do not collect payment.
            </p>
          </div>
        </main>
      </div>
    </MotionConfig>
  );
}

function EmptyState({ kind }: { kind: string }) {
  return (
    <div className="dashboard-empty">
      <span>
        <Ticket size={31} />
      </span>
      <h3>
        {kind === "filter"
          ? "A different path awaits."
          : kind === "giving"
            ? "A little kindness starts here."
            : kind === "past"
              ? "Memories are on their way."
              : "Your next chapter is waiting."}
      </h3>
      <p>
        {kind === "filter"
          ? "Try a different temple, reference, or status."
          : kind === "giving"
            ? "Support a temple and its neighbours, one intention at a time."
            : kind === "past"
              ? "Your past and cancelled journeys will appear here."
              : "Find a sacred place that speaks to you and plan your first visit."}
      </p>
      {kind !== "filter" && (
        <Link
          className="button primary"
          href={kind === "giving" ? "/#purpose" : "/#discover"}
        >
          {kind === "giving" ? "Find your cause" : "Find your temple"}
          <ArrowRight size={15} />
        </Link>
      )}
    </div>
  );
}
