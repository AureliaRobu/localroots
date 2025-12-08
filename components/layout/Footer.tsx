import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('about.title')}</h3>
            <p className="text-sm leading-relaxed">
              {t('about.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('quickLinks.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  {t('quickLinks.products')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-white transition-colors">
                  {t('quickLinks.map')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t('quickLinks.about')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  {t('quickLinks.joinAsFarmer')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('legal.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t('legal.terms')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">{t('contact.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:hello@localroots.com" className="hover:text-white transition-colors">
                  hello@localroots.com
                </a>
              </li>
              <li className="text-slate-400">
                {t('contact.address')}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          <p>
            © {currentYear} LocalRoots. {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
