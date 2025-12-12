import { useTranslation } from 'react-i18next';
import { NavLink } from '@/components/NavLink';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Camera, LayoutDashboard, Radio, Bug } from 'lucide-react';

export function Navigation() {
  const { t } = useTranslation();
  const linkClass = "flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground";
  const activeClass = "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-glow-sm";

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-sm">
              <Bug className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">{t('common.appName')}</h1>
              <p className="text-xs text-muted-foreground">{t('common.aiPowered')}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={linkClass} activeClassName={activeClass}>
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.predict')}</span>
            </NavLink>
            <NavLink to="/monitoring" className={linkClass} activeClassName={activeClass}>
              <Radio className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.live')}</span>
            </NavLink>
            <NavLink to="/dashboard" className={linkClass} activeClassName={activeClass}>
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.dashboard')}</span>
            </NavLink>
            <div className="ml-2 border-l pl-2 border-border">
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
