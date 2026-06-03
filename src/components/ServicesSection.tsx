"use client";

import { useState } from "react";
import { Users, Building2, Ruler, PaintBucket, Compass, HardHat, ClipboardCheck, UserCheck } from "lucide-react";
import ContactPopup from "./ContactPopup";

const services = [
  { icon: Users, label: "Agent / Brokers", desc: "Connect with verified real estate agents" },
  { icon: Building2, label: "Builders / Developers", desc: "Trusted construction partners" },
  { icon: Ruler, label: "Architects", desc: "Design your dream space" },
  { icon: PaintBucket, label: "Interior Decorators", desc: "Transform your interiors" },
  { icon: Compass, label: "Vaastu Consultant", desc: "Harmonize your living space" },
  { icon: HardHat, label: "Building Contractors", desc: "Quality construction services" },
  { icon: ClipboardCheck, label: "Home Inspection", desc: "Professional property assessment" },
  { icon: UserCheck, label: "Property Consultants", desc: "Expert guidance for investments" },
];

const ServicesSection = () => {
  const [popup, setPopup] = useState<string | null>(null);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/30 via-background to-secondary/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-3">
            Complete Real Estate Services
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">Everything you need under one roof</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((s) => (
            <div 
              key={s.label} 
              className="group bg-card rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer border border-border/50 hover:border-primary/30"
              onClick={() => setPopup(s.label)}
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-base mb-2">{s.label}</h3>
                <p className="text-muted-foreground text-sm flex-grow">{s.desc}</p>
                <div className="mt-4 text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Get in touch <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ContactPopup service={popup || ""} open={!!popup} onClose={() => setPopup(null)} />
    </section>
  );
};

export default ServicesSection;
