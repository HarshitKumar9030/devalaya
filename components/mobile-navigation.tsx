"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Heart, Ticket, X } from "lucide-react";

export const navigation = [
  {
    href: "#discover",
    label: "Discover temples",
    short: "Discover",
    detail: "Find a place that speaks to you.",
  },
  {
    href: "#purpose",
    label: "Our purpose",
    short: "Our purpose",
    detail: "A little kindness, a lasting difference.",
  },
  {
    href: "#how-it-works",
    label: "How it works",
    short: "How it works",
    detail: "A peaceful journey, from the start.",
  },
];

export function MobileNavigation({
  onClose,
  onBookings,
}: {
  onClose: () => void;
  onBookings: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const focused = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      focused?.focus();
    };
  }, []);
  return (
    <motion.dialog
      ref={dialog}
      id="mobile-navigation"
      aria-label="Main navigation"
      className="mobile-nav-dialog"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        className="mobile-nav-scrim"
        tabIndex={-1}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <motion.div
        className="mobile-nav-sheet"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 290, damping: 32 }}
      >
        <div className="mobile-nav-top">
          <a href="#" className="brand" onClick={onClose}>
            Devalaya<span className="brand-dot">.</span>
          </a>
          <motion.button
            className="sheet-close"
            autoFocus
            aria-label="Close navigation"
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <X size={21} />
          </motion.button>
        </div>
        <p className="mobile-nav-intro">A little closer to what matters.</p>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, i) => (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={onClose}
              initial={{ x: 22, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.3 }}
            >
              <span className="mobile-nav-number">0{i + 1}</span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </span>
              <ArrowUpRight size={21} />
            </motion.a>
          ))}
        </nav>
        <button
          className="mobile-bookings"
          onClick={() => {
            onClose();
            setTimeout(onBookings, 300);
          }}
        >
          <Ticket size={19} />
          My bookings
          <ArrowUpRight size={18} />
        </button>
        <div className="mobile-nav-bottom">
          <span>
            <Heart size={17} />
          </span>
          <p>
            Sacred places. Meaningful journeys.
            <br />
            An open heart is all you need.
          </p>
        </div>
      </motion.div>
    </motion.dialog>
  );
}
