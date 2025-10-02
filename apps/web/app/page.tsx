"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-gradient-to-t from-primary via-white to-secondary-foreground">
      {/* Background gradient orb */}

      {/* Navigation */}
      <nav className="fixed top-6 inset-x-0 z-50">
        <div className="mx-auto w-[min(92%,1120px)] rounded-full border border-foreground/10 bg-white px-4 py-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo_full.svg"
                alt="Saya"
                width={140}
                height={28}
                priority
              />
              <span className="sr-only">Sure</span>
            </Link>

            {/* Auth Links */}
            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-foreground/80 hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-0 grid min-h-[100svh] place-items-center px-6">
        {/* */}

        {/* Hero Section with 3D Icons */}
        <div className="relative max-w-5xl mx-auto">
          {/* Left Cursor Icon */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-32 hidden lg:block">
            <div className="w-48 h-48 relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-accent/40 rounded-3xl transform rotate-12 opacity-20 blur-2xl" />
              <Image
                src="/cursor.svg"
                alt="Cursor"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
                sizes="12rem"
              />
            </div>
          </div>

          {/* Right Message Icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-32 hidden lg:block">
            <div className="w-48 h-48 relative animate-float-delayed">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-primary/40 rounded-3xl transform -rotate-12 opacity-20 blur-2xl" />
              <Image
                src="/message.svg"
                alt="Message"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
                sizes="12rem"
              />
            </div>
          </div>

          {/* Main Text */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground mb-6">
              Train.{" "}
              <span className="bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                Design.
              </span>{" "}
              Deploy.
            </h1>

            <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
              Train and configure AI Agents that works for you. Upload relevant
              documents, integrate tools and embedd it right into your app
            </p>

            <div className="flex items-center justify-center gap-3">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm md:text-base font-medium shadow-sm hover:opacity-90 transition-colors"
              >
                Start free
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 px-6 py-3 text-sm md:text-base text-foreground hover:bg-foreground/5 transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-3 text-xs text-foreground/60">
              No credit card required
            </p>
          </div>
        </div>
      </main>

      {/* Add these styles to your global.css or as a style tag */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
