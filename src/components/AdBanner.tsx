import { useEffect, useRef } from "react";

interface AdBannerProps {
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function AdBanner({ className = "" }: AdBannerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Ad blocked or not loaded
      }
    }
  }, []);

  return (
    <div ref={ref} className={`text-center my-10 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px", borderRadius: "12px" }}
        data-ad-client="ca-pub-4249179140825065"
        data-ad-slot=""
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}