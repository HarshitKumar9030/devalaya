"use client";

import { useEffect, useRef, useState } from "react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Ticket,
  X,
} from "lucide-react";
import { SacredWorld } from "./sacred-world";
import { temples, type Temple } from "@/lib/temples";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { JourneyMotion } from "./journey-motion";
import { DesktopNavigation } from "./desktop-navigation";
import { MobileNavigation, navigation } from "./mobile-navigation";

function Lotus({ small = false }: { small?: boolean }) {
  return (
    <svg
      width={small ? 28 : 39}
      height={small ? 28 : 39}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path d="M20 32C7 32 3 22 3 17c10-2 17 4 17 15Z" fill="#9cc8f5" />
      <path d="M20 32c13 0 17-10 17-15-10-2-17 4-17 15Z" fill="#9cc8f5" />
      <path d="M20 31C9 24 10 13 13 9c8 4 11 14 7 22Z" fill="#72a9eb" />
      <path d="M20 31c11-7 10-18 7-22-8 4-11 14-7 22Z" fill="#72a9eb" />
      <path d="M20 30C9 19 16 8 20 3c4 5 11 16 0 27Z" fill="#3f83de" />
    </svg>
  );
}
function ClerkAccount() {
  const { isSignedIn } = useUser();
  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button className="button primary sign-in">
        Sign in <ArrowUpRight size={15} />
      </button>
    </SignInButton>
  );
}
type ModalState =
  | { kind: "booking" | "donation"; temple: Temple }
  | { kind: "auth" | "bookings" }
  | null;

export function Devalaya({ authConfigured }: { authConfigured: boolean }) {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All locations");
  const [deity, setDeity] = useState("All temples");
  const [showAll, setShowAll] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);
  const [closing, setClosing] = useState(false);
  const [activeNav, setActiveNav] = useState("#discover");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActiveNav("#" + entry.target.id);
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    navigation.forEach((item) => {
      const section = document.querySelector(item.href);
      if (section) observer.observe(section);
    });
    const onScroll = () => {
      if (window.scrollY < 180) setActiveNav("#discover");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  const visible = temples.filter(
    (t) =>
      (deity === "All temples" || t.deity === deity) &&
      (region === "All locations" || t.region === region) &&
      `${t.name} ${t.place} ${t.deity}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function close() {
    setClosing(true);
    const delay =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--modal-close-dur",
        ),
      ) || 150;
    setTimeout(() => {
      setModal(null);
      setClosing(false);
    }, delay);
  }
  return (
    <MotionConfig reducedMotion="user">
      <JourneyMotion />
      <header className="header">
        <a className="brand" href="#" aria-label="Devalaya home">
          <Lotus />
          <span>
            Devalaya<span className="brand-dot">.</span>
          </span>
        </a>
        <DesktopNavigation active={activeNav} onNavigate={setActiveNav} />
        <div className="header-actions">
          <button
            className="bookings-button"
            onClick={() => setModal({ kind: "bookings" })}
          >
            <Ticket size={17} />
            <span>My bookings</span>
          </button>
          {authConfigured ? (
            <ClerkAccount />
          ) : (
            <button
              className="button primary sign-in"
              onClick={() => setModal({ kind: "auth" })}
            >
              Sign in <ArrowUpRight size={15} />
            </button>
          )}
          <motion.button
            className="menu-button"
            aria-label="Open navigation"
            aria-controls="mobile-navigation"
            aria-expanded={mobileMenu}
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </motion.button>
        </div>
      </header>
      <AnimatePresence>
        {mobileMenu && (
          <MobileNavigation
            key="mobile-menu"
            onClose={() => setMobileMenu(false)}
            onBookings={() => setModal({ kind: "bookings" })}
          />
        )}
      </AnimatePresence>
      <main className="journey-page">
        <svg
          className="whole-page-path"
          viewBox="0 0 1440 2800"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="journey-dashes"
            d="M700 640C700 800 40 760 45 1060S1390 1120 1390 1450 50 1560 50 1970 1390 2010 1390 2400 850 2530 720 2770"
            fill="none"
            stroke="#c0d5eb"
            strokeWidth="1.5"
            strokeDasharray="5 12"
          />
          <path
            className="journey-progress"
            d="M700 640C700 800 40 760 45 1060S1390 1120 1390 1450 50 1560 50 1970 1390 2010 1390 2400 850 2530 720 2770"
            fill="none"
            stroke="#82aedd"
            strokeWidth="2"
          />
          <circle r="4" fill="#9cbde0" className="traveler">
            <animateMotion
              dur="65s"
              repeatCount="indefinite"
              path="M700 640C700 800 40 760 45 1060S1390 1120 1390 1450 50 1560 50 1970 1390 2010 1390 2400 850 2530 720 2770"
            />
          </circle>
        </svg>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Some journeys
              <br />
              bring you <em>home.</em>
            </h1>
            <p>
              Discover sacred places. Book a peaceful darshan.
              <br className="desktop-break" /> Give with an open heart.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#discover">
                Find your temple <ArrowRight size={17} />
              </a>
              <a className="button soft" href="#purpose">
                A little good, a long way <Heart size={16} />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <span className="scene-label village-label">
              <span className="label-dot mint-dot" />
              Stronger communities
            </span>
            <span className="scene-label temple-label">
              <span className="label-dot" />
              Closer to the divine
            </span>
            <span className="scene-label giving-label">
              <Heart size={12} />
              Giving that matters
            </span>
            <SacredWorld />
          </div>
          <div className="hero-foot">
            <span>
              <ShieldCheck size={14} />
              Thoughtfully planned. Deeply felt.
            </span>
            <a href="#discover">
              Your journey begins here <ChevronDown size={14} />
            </a>
          </div>
        </section>
        <section className="discover-section section-wrap" id="discover">
          <form
            className="search-bar"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(query);
              setShowAll(true);
            }}
          >
            <label className="search-input">
              <Search size={21} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="A temple, a city, a calling…"
                aria-label="Search temples"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    setSearch("");
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </label>
            <label className="location-select">
              <MapPin size={19} />
              <select
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setShowAll(true);
                }}
                aria-label="Temple location"
              >
                <option>All locations</option>
                {["North India", "South India", "East India", "West India"].map(
                  (r) => (
                    <option key={r}>{r}</option>
                  ),
                )}
              </select>
              <ChevronDown size={15} />
            </label>
            <button className="button primary" type="submit">
              Explore temples <ArrowRight size={17} />
            </button>
          </form>
          <div className="section-heading">
            <span className="section-caption">A PLACE FOR YOUR FAITH</span>
            <h2>A sacred place for every soul.</h2>
            <p>Different paths. One beautiful feeling of belonging.</p>
          </div>
          <div className="temple-tools">
            <div className="filter-tabs" aria-label="Filter by deity">
              {["All temples", "Shiva", "Vishnu", "Shakti", "Ganesha"].map(
                (d) => (
                  <button
                    key={d}
                    aria-pressed={deity === d}
                    className={deity === d ? "selected" : ""}
                    onClick={() => {
                      setDeity(d);
                      setShowAll(true);
                    }}
                  >
                    {d}
                  </button>
                ),
              )}
            </div>
            <button
              className="text-link all-temples"
              onClick={() => {
                setShowAll(!showAll);
                if (showAll) {
                  setSearch("");
                  setQuery("");
                  setRegion("All locations");
                  setDeity("All temples");
                }
              }}
            >
              {showAll ? "Show featured" : "View all temples"}{" "}
              <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="temple-grid">
            {visible.slice(0, showAll ? 6 : 3).map((t) => (
              <article className={`temple-card ${t.color}`} key={t.id}>
                <div className="temple-art">
                  <span className="card-tag">{t.type}</span>
                  <SacredWorld variant={t.color} compact />
                </div>
                <div className="temple-info">
                  <span className="temple-location">
                    <MapPin size={13} />
                    {t.place}
                  </span>
                  <h3>{t.name}</h3>
                  <p>{t.note}</p>
                  <button
                    className="card-button"
                    onClick={() => setModal({ kind: "booking", temple: t })}
                  >
                    Book darshan <ArrowUpRight size={18} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {visible.length === 0 && (
            <div className="empty-state">
              <Search size={28} />
              <h3>A different path awaits.</h3>
              <p>
                No temples match these filters. Try a city or another deity.
              </p>
              <button
                className="button soft"
                onClick={() => {
                  setSearch("");
                  setQuery("");
                  setRegion("All locations");
                  setDeity("All temples");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
          <p className="catalogue-note">
            A glimpse of what’s possible. Temple listings and darshan prices are
            illustrative.
          </p>
        </section>
        <section className="purpose-section" id="purpose">
          <svg
            className="page-trail"
            viewBox="0 0 1440 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 80C200-70 180 470 430 430S800 50 1100 190 1290 700 1440 540"
              fill="none"
              stroke="#bed4ca"
              strokeWidth="1.5"
              strokeDasharray="6 10"
              className="journey-dashes"
            />
          </svg>
          <div className="section-wrap purpose-inner">
            <div className="section-heading">
              <span className="section-caption">DEVOTION, BEYOND DARSHAN</span>
              <h2>
                Faith that finds its
                <br />
                way to <em>others.</em>
              </h2>
              <p>
                A visit can touch your soul. A little kindness can touch a life.
              </p>
            </div>
            <div className="giving-layout">
              <div className="giving-art">
                <SacredWorld compact variant="mint" />
                <span className="giving-art-note">
                  <Heart size={17} />
                  Small acts. Sacred impact.
                </span>
              </div>
              <div className="giving-content">
                <h3>
                  Give to a place.
                  <br />
                  Care for its people.
                </h3>
                <p>
                  Support the temple you feel connected to, or help provide
                  meals and everyday essentials to the communities living around
                  it.
                </p>
                <div className="giving-principle">
                  <ShieldCheck size={22} />
                  <p>
                    <strong>Your chosen temple. Your intention.</strong>
                    <span>
                      Every donation belongs to one temple. Each temple manages
                      its own giving, independently.
                    </span>
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() =>
                    setModal({ kind: "donation", temple: temples[0] })
                  }
                >
                  Find a cause close to your heart <Heart size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="how-section section-wrap">
          <div className="section-heading">
            <span className="section-caption">
              LESS PLANNING. MORE PRESENCE.
            </span>
            <h2>A peaceful journey, from the start.</h2>
            <p>
              We take care of the little things, so you can be there for the big
              ones.
            </p>
          </div>
          <div className="steps">
            <article>
              <span className="step-icon blue">
                <Search size={23} />
              </span>
              <span className="step-number">01 / DISCOVER</span>
              <h3>Follow your calling.</h3>
              <p>
                Find a sacred place that speaks to you, near home or a little
                further away.
              </p>
            </article>
            <article>
              <span className="step-icon lilac">
                <CalendarDays size={23} />
              </span>
              <span className="step-number">02 / PLAN</span>
              <h3>Make room for a moment.</h3>
              <p>
                Choose your darshan date, time, and companions. Keep your plans
                in one place.
              </p>
            </article>
            <article>
              <span className="step-icon mint">
                <Heart size={23} />
              </span>
              <span className="step-number">03 / CONNECT</span>
              <h3>Arrive with an open heart.</h3>
              <p>
                Be present in your visit. Leave a little kindness with the
                temple and its people.
              </p>
            </article>
          </div>
        </section>
        <section className="closing-section section-wrap">
          <Lotus />
          <h2>
            Your next journey
            <br />
            could bring you <em>closer.</em>
          </h2>
          <a className="button primary" href="#discover">
            Let’s find your temple <ArrowRight size={17} />
          </a>
          <span className="closing-petal petal-one" aria-hidden="true" />
          <span className="closing-petal petal-two" aria-hidden="true" />
        </section>
      </main>
      <footer className="footer section-wrap">
        <a href="#" className="brand">
          <Lotus small />
          <span>Devalaya.</span>
        </a>
        <span>Made for journeys that mean something.</span>
        <span>© {new Date().getFullYear()} Devalaya</span>
      </footer>
      {modal && (
        <Modal
          modal={modal}
          closing={closing}
          close={close}
          authConfigured={authConfigured}
          onTempleChange={(temple) => setModal({ kind: "donation", temple })}
        />
      )}
    </MotionConfig>
  );
}

function Modal({
  modal,
  close,
  closing,
  authConfigured,
  onTempleChange,
}: {
  modal: NonNullable<ModalState>;
  close: () => void;
  closing: boolean;
  authConfigured: boolean;
  onTempleChange: (t: Temple) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("07:00");
  const [people, setPeople] = useState(1);
  const [amount, setAmount] = useState(501);
  const [cause, setCause] = useState("Temple upkeep");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  const temple = "temple" in modal ? modal.temple : null;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          modal.kind === "booking"
            ? { kind: "booking", templeId: temple?.id, date, time, people }
            : { kind: "donation", templeId: temple?.id, amount, cause },
        ),
      });
      const result = await response.json();
      setMessage(result.message || result.error);
    } catch {
      setMessage("We couldn’t reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <dialog
      ref={ref}
      aria-label={
        modal.kind === "booking"
          ? "Plan your darshan"
          : modal.kind === "donation"
            ? "Temple donation"
            : "Your Devalaya account"
      }
      className={`modal t-modal ${closing ? "is-closing" : "is-open"}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
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
        <span className="modal-lotus">
          <Lotus />
        </span>
        {modal.kind === "auth" ? (
          <>
            <h2>A little closer.</h2>
            <p>Sign in to keep your temple visits and giving in one place.</p>
            <div className="setup-note">
              <ShieldCheck size={24} />
              <p>
                Clerk authentication is ready to connect. Add your Clerk keys to{" "}
                <code>.env.local</code> to enable secure sign-in.
              </p>
            </div>
            <button className="button primary full" onClick={close}>
              Keep exploring <ArrowRight size={16} />
            </button>
          </>
        ) : modal.kind === "bookings" ? (
          <>
            <h2>Your sacred journeys.</h2>
            <p>Your upcoming darshans will find a home here.</p>
            <div className="setup-note">
              <Ticket size={28} />
              <p>
                {authConfigured
                  ? "Sign in to view your booking requests."
                  : "Sign in will be available once Clerk is connected. Browse temples to plan your first visit."}
              </p>
            </div>
            {authConfigured ? (
              <SignInButton mode="modal">
                <button className="button primary full">
                  Sign in to view bookings
                </button>
              </SignInButton>
            ) : (
              <button className="button primary full" onClick={close}>
                Discover your next journey <ArrowRight size={16} />
              </button>
            )}
          </>
        ) : (
          <>
            <h2>
              {modal.kind === "booking"
                ? "Make time for the divine."
                : "A little kindness goes far."}
            </h2>
            <p>
              {modal.kind === "booking"
                ? temple?.name
                : "Choose one temple and a cause close to your heart."}
            </p>
            <form onSubmit={submit} className="transaction-form">
              {modal.kind === "donation" ? (
                <>
                  <label>
                    Your temple
                    <select
                      value={temple?.id}
                      onChange={(e) =>
                        onTempleChange(
                          temples.find((t) => t.id === e.target.value)!,
                        )
                      }
                    >
                      {temples.map((t) => (
                        <option value={t.id} key={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Your intention
                    <select
                      value={cause}
                      onChange={(e) => setCause(e.target.value)}
                    >
                      <option>Temple upkeep</option>
                      <option>Community meals</option>
                      <option>Local family essentials</option>
                    </select>
                  </label>
                  <label>
                    Donation amount (₹)
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      required
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                    />
                  </label>
                  <div className="amount-options">
                    {[101, 501, 1001, 2100].map((a) => (
                      <button
                        key={a}
                        type="button"
                        className={a === amount ? "selected" : ""}
                        onClick={() => setAmount(a)}
                      >
                        ₹{a.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <p className="privacy-note">
                    <ShieldCheck size={16} />
                    Only {temple?.name} manages this donation. Funds are never
                    pooled across temples.
                  </p>
                </>
              ) : (
                <>
                  <label>
                    Date of visit
                    <input
                      type="date"
                      required
                      min={new Date().toLocaleDateString("en-CA", {
                        timeZone: "Asia/Kolkata",
                      })}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </label>
                  <div className="form-row">
                    <label>
                      Preferred time
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      >
                        {["07:00", "09:00", "11:00", "15:00", "17:00"].map(
                          (t) => (
                            <option key={t}>{t}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Devotees
                      <input
                        type="number"
                        min="1"
                        max="10"
                        required
                        value={people}
                        onChange={(e) => setPeople(Number(e.target.value))}
                      />
                    </label>
                  </div>
                  <div className="booking-summary">
                    <span>Illustrative darshan total</span>
                    <strong>
                      {temple?.price
                        ? `₹${(temple.price * people).toLocaleString("en-IN")}`
                        : "Free darshan"}
                    </strong>
                  </div>
                  <p className="privacy-note">
                    This is a visit request. Actual temple availability and
                    payment must be confirmed before a ticket can be issued.
                  </p>
                </>
              )}
              {message && (
                <p className="form-message" role="status">
                  {message}
                </p>
              )}
              <button
                className="button primary full"
                disabled={loading}
                type="submit"
              >
                {loading
                  ? "One moment…"
                  : modal.kind === "booking"
                    ? "Request this visit"
                    : "Save donation intention"}
                {!loading && <ArrowRight size={17} />}
              </button>
              <small className="no-charge">
                <Check size={12} />
                No payment is collected in this preview.
              </small>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
