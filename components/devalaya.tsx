"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
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
import { useSessionGuard } from "./auth/session-provider";
import { CustomSelect, TextInput } from "./ui/form-controls";
import { TransactionDialog, type Transaction } from "./transaction-dialog";

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
  const { isSignedIn, isLoaded, signIn } = useSessionGuard();
  return isSignedIn ? (
    <UserButton />
  ) : (
    <button
      className="button primary sign-in"
      onClick={signIn}
      disabled={!isLoaded}
    >
      {isLoaded ? "Sign in" : "Loading…"}
      <ArrowUpRight size={15} />
    </button>
  );
}

export function Devalaya() {
  const guard = useSessionGuard();
  const router = useRouter();
  const openDashboard = () =>
    guard.protect(() => router.push("/account/bookings"));
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All locations");
  const [deity, setDeity] = useState("All temples");
  const [showAll, setShowAll] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [modal, setModal] = useState<Transaction | null>(null);
  const [closing, setClosing] = useState(false);
  const [activeNav, setActiveNav] = useState("#discover");
  useEffect(() => {
    if (!guard.isSignedIn) {
      setModal(null);
      setClosing(false);
    }
  }, [guard.isSignedIn]);
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
          <button className="bookings-button" onClick={openDashboard}>
            <Ticket size={17} />
            <span>My bookings</span>
          </button>
          <ClerkAccount />
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
            onBookings={openDashboard}
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
            <TextInput
              className="search-field"
              icon={<Search size={21} />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="A temple, a city, a calling…"
              aria-label="Search temples"
              trailing={
                query ? (
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
                ) : undefined
              }
            />
            <CustomSelect
              compact
              ariaLabel="Temple location"
              value={region}
              onValueChange={(value) => {
                setRegion(value);
                setShowAll(true);
              }}
              icon={<MapPin size={18} />}
              options={[
                "All locations",
                "North India",
                "South India",
                "East India",
                "West India",
              ].map((value) => ({ value, label: value }))}
            />
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
                    onClick={() =>
                      guard.protect(() =>
                        setModal({ kind: "booking", temple: t }),
                      )
                    }
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
                    guard.protect(() =>
                      setModal({ kind: "donation", temple: temples[0] }),
                    )
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
        <TransactionDialog
          transaction={modal}
          closing={closing}
          close={close}
          onTempleChange={(temple) => setModal({ kind: "donation", temple })}
        />
      )}
    </MotionConfig>
  );
}
