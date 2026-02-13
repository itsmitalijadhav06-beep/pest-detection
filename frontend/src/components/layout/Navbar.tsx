import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  Camera,
  Radio,
  LayoutDashboard,
  Languages,
  Bug,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
  // ✅ added

const languages = [
  { code: 'en', name: 'English', label: 'English' },
  { code: 'hi', name: 'हिंदी', label: 'Hindi' },
  { code: 'mr', name: 'मराठी', label: 'Marathi' },
];

export const Navbar = () => {
  const location = useLocation();
  const [language, setLanguage] = useState('en');
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();   // ✅ added

  const navItems = [
  { path: '/predict', label: t("predict"), icon: Camera },
  { path: '/live', label: t("live"), icon: Radio },
  { path: '/dashboard', label: t("dashboard"), icon: LayoutDashboard },
];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        
        {/* LOGO */}
        <Link to="/predict" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Bug className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">PestGuard</span>
            <span className="text-xs text-muted-foreground">
              {t("aiPestDetection")}
            </span>
          </div>
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'navActive' : 'nav'}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}

          {/* LANGUAGE */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 ml-2">
                <Languages className="h-4 w-4" />
                <span className="hidden sm:inline">{currentLang?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    i18n.changeLanguage(lang.code);  // ✅ ONLY FIX
                  }}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* SIGN OUT */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="gap-2 ml-2 text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t("signOut")}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};