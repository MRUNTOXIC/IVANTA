"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X, ChevronDown, User, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RequirementForm from "@/components/RequirementForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const buyOptions = [
  { label: "Residential", path: "/properties?type=buy", type: "buy" },
  { label: "Commercial", path: "/properties?type=commercial", type: "commercial" },
  { label: "Plots / Lands", path: "/properties?type=plots", type: "plots" },
];

const navLinks = [
  { label: "Home", path: "/", type: null },
  { label: "Rentals", path: "/properties?type=rent", type: "rent" },
  // { label: "PG / Hostel", path: "/properties?type=pg", type: "pg" },
  { label: "Builder Projects", path: "/properties?type=new", type: "new" },
  { label: "Loans", path: "/loans", type: null },
  { label: "About Us", path: "/about", type: null },
];

const Navbar = () => {
  const pathname = usePathname();
  let searchParams;
  try {
    searchParams = useSearchParams();
  } catch {
    searchParams = null;
  }
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (path: string, type: string | null) => {
    if (path === '/' && pathname === '/') return true;
    if (path.includes('/properties') && pathname === '/properties') {
      const urlType = searchParams?.get('type');
      return urlType === type;
    }
    return pathname === path;
  };

  const isBuyActive = () => {
    if (pathname === '/properties') {
      const urlType = searchParams?.get('type');
      return ['buy', 'commercial', 'plots'].includes(urlType || '');
    }
    return false;
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUserData(data.data);
        } else {
          setIsLoggedIn(false);
          setUserData(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const controlNavbar = () => {
      if (mobileOpen) return; // don't hide navbar while mobile menu is open
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY, mobileOpen]);

  const visibleBuyOptions = buyOptions;

  const visibleNavLinks = navLinks;

  return (
    <>
    <nav className={`sticky top-0 z-50 bg-background navbar-shadow transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto flex items-center justify-between py-3 px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src="/IvantaLogo.png" alt="Ivanta Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1">
          {/* Home Link */}
          <Link
            href="/"
            className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
              isActive('/', null)
                ? 'text-primary bg-primary/10 font-semibold'
                : 'text-foreground/80 hover:text-primary hover:bg-secondary'
            }`}
          >
            Home
          </Link>

          {/* Buy Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={`px-3 py-2 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${
              isBuyActive()
                ? 'text-primary bg-primary/10 font-semibold'
                : 'text-foreground/80 hover:text-primary hover:bg-secondary'
            }`}>
              Buy
              <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {visibleBuyOptions.map((option) => (
                <DropdownMenuItem key={option.label} asChild>
                  <Link href={option.path} className="cursor-pointer">
                    {option.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {visibleNavLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              href={link.path}
              className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                isActive(link.path, link.type)
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-foreground/80 hover:text-primary hover:bg-secondary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + Login/Profile */}
        <div className="hidden lg:flex items-center gap-2">
          {isLoggedIn && userData ? (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userData.picture} alt={userData.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userData.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{userData.name}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setIsLoggedIn(false);
                    setUserData(null);
                    window.location.href = '/';
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-foreground/80">
                Login
              </Button>
            </Link>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowRequirementForm(true)}
            className="gap-2 border-primary text-primary hover:bg-primary/60"
          >
            <Headphones className="w-4 h-4" />
            Post Requirement
          </Button>
          {isLoggedIn ? (
            <Link href="/post-property">
              <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold">
                Post Property
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity font-semibold">
                Post Property
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>


    </nav>

      {/* Mobile Menu — fixed full-screen overlay, independent of navbar scroll */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col" style={{ top: 0 }}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          
          {/* Drawer panel */}
          <div className="relative ml-auto w-full h-full bg-background shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
              <img src="/IvantaLogo.png" alt="Ivanta Logo" className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="p-2 text-foreground" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors rounded-md ${
                  isActive('/', null)
                    ? 'text-primary bg-primary/10 font-semibold'
                    : 'text-foreground/80 hover:text-primary hover:bg-secondary'
                }`}
              >
                Home
              </Link>

              <div className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Buy
              </div>
              {visibleBuyOptions.map((option) => (
                <Link
                  key={option.label}
                  href={option.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors rounded-md pl-8 ${
                    isActive(option.path, option.type)
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-foreground/80 hover:text-primary hover:bg-secondary'
                  }`}
                >
                  {option.label}
                </Link>
              ))}

              {visibleNavLinks.slice(1).map((link) => (
                <Link
                  key={link.label}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-medium transition-colors rounded-md ${
                    isActive(link.path, link.type)
                      ? 'text-primary bg-primary/10 font-semibold'
                      : 'text-foreground/80 hover:text-primary hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Footer actions */}
            <div className="shrink-0 px-4 py-4 border-t border-border flex flex-col gap-2">
              {isLoggedIn && userData ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-secondary rounded-md">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={userData.picture} alt={userData.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {userData.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={async () => {
                      await fetch('/api/auth/logout', { method: 'POST' });
                      setIsLoggedIn(false);
                      setUserData(null);
                      setMobileOpen(false);
                      window.location.href = '/';
                    }}
                  >
                    Logout
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-primary text-primary"
                    onClick={() => { setMobileOpen(false); setShowRequirementForm(true); }}
                  >
                    <Headphones className="w-4 h-4" />
                    Post Requirement
                  </Button>
                  <Link href="/post-property" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-primary text-primary-foreground font-semibold">
                      Post Property
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-primary text-primary"
                    onClick={() => { setMobileOpen(false); setShowRequirementForm(true); }}
                  >
                    <Headphones className="w-4 h-4" />
                    Post Requirement
                  </Button>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-primary text-primary-foreground font-semibold">
                      Post Property
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    
    {/* Requirement Form Popup - Rendered outside nav */}
    <RequirementForm isOpen={showRequirementForm} onClose={() => setShowRequirementForm(false)} />
    </>
  );
};

export default Navbar;
