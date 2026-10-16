"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Heart,
  MapPin,
  X,
} from "lucide-react";
import { navigation } from "./mobile-navigation";
import { SacredWorld } from "./sacred-world";

export function DesktopNavigation({
  active,
  onNavigate,
}: {
  active: string;
  onNavigate: (href: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="nav-pill" aria-label="Main navigation">
        <motion.button
          className={`nav-explore ${active === "#discover" ? "nav-active" : ""}`}
          aria-expanded={open}
          aria-controls="desktop-navigation"
          onClick={() => setOpen(true)}
          whileTap={{ scale: 0.96 }}
        >
          {active === "#discover" && (
            <motion.span
              className="nav-indicator"
              layoutId="navigation-highlight"
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
            />
          )}
          <span>Explore</span>
          <ChevronDown size={13} />
        </motion.button>
        {navigation.slice(1).map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={active === item.href ? "location" : undefined}
            className={active === item.href ? "nav-active" : ""}
            onClick={() => onNavigate(item.href)}
          >
            {active === item.href && (
              <motion.span
                className="nav-indicator"
                layoutId="navigation-highlight"
                transition={{ type: "spring", stiffness: 350, damping: 32 }}
              />
            )}
            <span>{item.short}</span>
          </a>
        ))}
      </nav>
      <AnimatePresence>
        {open && (
          <NavigationPanel
            onClose={() => setOpen(false)}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function NavigationPanel({
  onClose,
  onNavigate,
}: {
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
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
  const navigate = (href: string) => {
    onNavigate(href);
    onClose();
  };
  return (
    <motion.dialog
      ref={ref}
      id="desktop-navigation"
      className="desktop-nav-dialog"
      aria-label="Explore Devalaya"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.button
        className="desktop-nav-scrim"
        aria-label="Dismiss navigation"
        tabIndex={-1}
        onClick={onClose}
        initial={{ backdropFilter: "blur(0px)" }}
        animate={{ backdropFilter: "blur(14px)" }}
        exit={{ backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.35 }}
      />
      <div className="desktop-nav-positioner">
        <motion.div
          className="desktop-nav-panel"
          initial={{ y: -18, scale: 0.94, opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -10, scale: 0.97, opacity: 0, filter: "blur(4px)" }}
          transition={{ type: "spring", stiffness: 320, damping: 29 }}
        >
          <div className="desktop-panel-top">
            <span>Make space for something meaningful.</span>
            <motion.button
              autoFocus
              onClick={onClose}
              aria-label="Close navigation"
              className="sheet-close"
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>
          </div>
          <div className="desktop-panel-grid">
            <nav aria-label="Explore links">
              {navigation.map((item, i) => (
                <motion.a
                  href={item.href}
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
                  whileHover={{ x: 5 }}
                >
                  <span className={`popup-link-icon popup-icon-${i}`}>
                    {i === 0 ? (
                      <MapPin size={20} />
                    ) : i === 1 ? (
                      <Heart size={20} />
                    ) : (
                      <ArrowRight size={20} />
                    )}
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <ArrowUpRight size={17} />
                </motion.a>
              ))}
            </nav>
            <a
              className="nav-feature"
              href="#discover"
              onClick={() => navigate("#discover")}
            >
              <span className="nav-feature-label">A moment of stillness</span>
              <div className="nav-feature-art">
                <SacredWorld compact variant="blue" />
              </div>
              <div className="nav-feature-bottom">
                <span>Your journey starts here.</span>
                <ArrowUpRight size={18} />
              </div>
            </a>
          </div>
          <div className="desktop-panel-bottom">
            <Heart size={12} />
            <span>Sacred places. Open hearts. A little closer.</span>
            <span>DEVALAYA</span>
          </div>
        </motion.div>
      </div>
    </motion.dialog>
  );
}
