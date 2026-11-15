"use client";

import { useEffect } from "react";

const scrollbarCss = `
  html.scrollbar-hidden,
  html.scrollbar-hidden body {
    scrollbar-width: none;
  }

  html.scrollbar-hidden {
    overflow-x: clip;
  }

  html.scrollbar-hidden::-webkit-scrollbar,
  html.scrollbar-hidden body::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
`;

export function HideScrollbar() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarCss;
    document.head.appendChild(style);
    document.documentElement.classList.add("scrollbar-hidden");

    return () => {
      document.documentElement.classList.remove("scrollbar-hidden");
      style.remove();
    };
  }, []);

  return null;
}
