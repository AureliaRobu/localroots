'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CookieConsent() {
  const t = useTranslations('cookieConsent');
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent via cookie
    const consent = getCookie('cookieConsent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  const setCookie = (name: string, value: string, days: number = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
  };

  const acceptCookies = () => {
    setCookie('cookieConsent', 'accepted');
    setShowConsent(false);
  };

  const declineCookies = () => {
    setCookie('cookieConsent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-lg">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
            <p className="text-sm text-slate-700">
              {t('message')}{' '}
              <Link href="/privacy" className="text-green-600 hover:text-green-700 hover:underline font-medium transition-colors">
                {t('learnMore')}
              </Link>
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={declineCookies}
              className="whitespace-nowrap border-slate-300 hover:bg-slate-100"
            >
              {t('decline')}
            </Button>
            <Button
              size="sm"
              onClick={acceptCookies}
              className="whitespace-nowrap bg-green-600 hover:bg-green-700 text-white"
            >
              {t('accept')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
