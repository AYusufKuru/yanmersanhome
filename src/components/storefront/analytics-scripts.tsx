import Script from "next/script";
import { analyticsIds } from "@/lib/analytics";

export function AnalyticsScripts({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  const { gaId, adsId, pixelId } = analyticsIds();
  const gtagId = gaId || adsId;
  if (!gtagId && !pixelId) {
    return null;
  }

  return (
    <>
      {gtagId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="yanmersan-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());${
              gaId ? `gtag('config','${gaId}',{anonymize_ip:true});` : ""
            }${adsId ? `gtag('config','${adsId}');` : ""}`}
          </Script>
        </>
      ) : null}
      {pixelId ? (
        <Script id="yanmersan-meta" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}
    </>
  );
}
