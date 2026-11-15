"use client";

import { useEffect } from "react";

export function AccountChrome() {
  useEffect(() => {
    const surface = document.querySelector(".store-surface");
    surface?.classList.add("account-open");
    return () => surface?.classList.remove("account-open");
  }, []);

  return null;
}
