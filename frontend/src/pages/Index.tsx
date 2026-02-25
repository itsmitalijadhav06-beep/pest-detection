import { Link } from "react-router-dom";
import {
  Bug,
  Zap,
  Target,
  Shield,
  Upload,
  Cpu,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroBackground from "@/assets/hero-rice-field.jpg";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

/* =======================
   Logo Component
======================= */
const Logo = ({
  size = "sm",
  showText = true,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) => {
  const sizeClasses = { sm: "w-9 h-9", md: "w-16 h-16", lg: "w-24 h-24" };
  const iconSizes = { sm: 18, md: 32, lg: 48 };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} bg-primary rounded-xl flex items-center justify-center relative shadow-md`}
      >
        <div
          className="absolute inset-1 border-2 border-primary-foreground/30 rounded-lg"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 15%, 100% 70%, 50% 100%, 0% 70%, 0% 15%)",
          }}
        />
        <Bug
          className="text-primary-foreground"
          size={iconSizes[size]}
          strokeWidth={2.5}
        />
      </div>

      {showText && (
        <span className="text-xl font-bold text-foreground">
          PestGuard <span className="text-primary">AI</span>
        </span>
      )}
    </div>
  );
};

/* =======================
   Header
======================= */
const Header = () => {
  const { t } = useTranslation();

  const changeLanguage = (lang: "en" | "hi" | "mr") => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo size="sm" showText />
        </Link>

        <nav className="flex items-center gap-4">
          <select
            onChange={(e) => changeLanguage(e.target.value as any)}
            value={i18n.language}
            className="border rounded-md px-2 py-1 text-sm bg-white"
          >
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>

          <Link to="/signin">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              {t("login")}
            </Button>
          </Link>

          <Link to="/signup">
            <Button variant="default">
              {t("signup")}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

/* =======================
   Hero Section
======================= */
const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center pt-20"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/80" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={false} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
          {t("landingTitle")}
        </h1>

        <p className="text-lg md:text-xl text-black/70 mb-4 max-w-2xl mx-auto">
          {t("landingSubtitle")}
        </p>

        <p className="text-base text-black/60 mb-10 max-w-xl mx-auto">
          {t("landingDescription")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signin">
            <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg">
              {t("detectPest")}
            </Button>
          </Link>

          <Link to="/signin">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg rounded-full bg-white/80 backdrop-blur-sm border-black/20 text-black hover:bg-white"
            >
              {t("login")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

/* =======================
   Stats Bar
======================= */
const StatsBar = () => {
  const { t } = useTranslation();

  const stats = [
    { value: "95%+", label: t("stats_accuracy") },
    { value: "5+", label: t("stats_species") },
    { value: "<3s", label: t("stats_time") },
    { value: "24/7", label: t("stats_availability") },
  ];

  return (
    <section className="bg-primary py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-primary-foreground/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* =======================
   About Section
======================= */
const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative py-20"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />
      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-8">
          {t("about_title")}
        </h2>
        <p className="text-base md:text-lg text-black/70 mb-6">
          {t("about_desc1")}
        </p>
        <p className="text-base md:text-lg text-black/70">
          {t("about_desc2")}
        </p>
      </div>
    </section>
  );
};

/* =======================
   How It Works
======================= */
const steps = [
  { icon: Upload, step: "01", title: "Upload Image", description: "Upload a photo of the affected crop." },
  { icon: Cpu, step: "02", title: "AI Analysis", description: "AI analyzes the image for pests." },
  { icon: FileCheck, step: "03", title: "Get Results", description: "Instant pest identification." },
  { icon: ClipboardList, step: "04", title: "Take Action", description: "Follow recommended treatment." },
];

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Upload,
      step: "01",
      title: t("step1_title"),
      description: t("step1_desc"),
    },
    {
      icon: Cpu,
      step: "02",
      title: t("step2_title"),
      description: t("step2_desc"),
    },
    {
      icon: FileCheck,
      step: "03",
      title: t("step3_title"),
      description: t("step3_desc"),
    },
    {
      icon: ClipboardList,
      step: "04",
      title: t("step4_title"),
      description: t("step4_desc"),
    },
  ];

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
          {t("how_title")}
        </h2>
        <p className="text-muted-foreground text-center mb-14 max-w-2xl mx-auto">
          {t("how_subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow relative z-10">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow">
                  {item.step}
                </div>

                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mt-6 mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
/* =======================
   Features
======================= */
const features = [
  { icon: Zap, title: "Instant Detection", description: "Results in seconds." },
  { icon: Target, title: "High Accuracy", description: "Reliable pest classification." },
  { icon: Shield, title: "Crop Protection", description: "Prevent major losses." },
  { icon: Bug, title: "Pest Focused", description: "Designed for rice pests." },
];

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Zap, title: t("feature1_title"), description: t("feature1_desc") },
    { icon: Target, title: t("feature2_title"), description: t("feature2_desc") },
    { icon: Shield, title: t("feature3_title"), description: t("feature3_desc") },
    { icon: Bug, title: t("feature4_title"), description: t("feature4_desc") },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-14">
          {t("why_title")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="w-14 h-14 rounded-full border flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
/* =======================
   Main Page
======================= */
const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <HowItWorks />
      <FeaturesSection />
    </main>
  </div>
);

export default Index;