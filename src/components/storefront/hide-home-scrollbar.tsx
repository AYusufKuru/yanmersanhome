"use client";

import { useEffect } from "react";

const scrollbarCss = `
  html.home-scrollbar-hidden {
    overflow-x: clip;
    scrollbar-width: none;
  }

  html.home-scrollbar-hidden::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`;

export function HideHomeScrollbar() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarCss;
    document.head.appendChild(style);
    document.documentElement.classList.add("home-scrollbar-hidden");

    return () => {
      document.documentElement.classList.remove("home-scrollbar-hidden");
      style.remove();
    };
  }, []);

  return null;
}
