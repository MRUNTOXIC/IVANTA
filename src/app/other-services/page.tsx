"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ContactPopup from "@/components/ContactPopup";
import { Users, Building2, Ruler, PaintBucket, Compass, HardHat, ClipboardCheck, UserCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  { 
    icon: Users, 
    label: "Agent / Brokers", 
    desc: "Connect with verified real estate agents",
    features: ["Verified professionals", "Local market expertise", "Negotiation support", "End-to-end assistance"]
  },
  { 
    icon: Building2, 
    label: "Builders / Developers", 
    desc: "Trusted construction partners",
    features: ["Licensed builders", "Quality assurance", "Timely delivery", "Transparent pricing"]
  },
  { 
    icon: Ruler, 
    label: "Architects", 
    desc: "Design your dream space",
    features: ["Custom designs", "3D visualization", "Permit assistance", "Sustainable solutions"]
  },
  { 
    icon: PaintBucket, 
    label: "Interior Decorators", 
    desc: "Transform your interiors",
    features: ["Modern aesthetics", "Space optimization", "Budget-friendly options", "Turnkey solutions"]
  },
  { 
    icon: Compass, 
    label: "Vaastu Consultant", 
    desc: "Harmonize your living space",
    features: ["Traditional wisdom", "Scientific approach", "Remedial solutions", "Personalized guidance"]
  },
  { 
    icon: HardHat, 
    label: "Building Contractors", 
    desc: "Quality construction services",
    features: ["Skilled workforce", "Material sourcing", "Project management", "Safety compliance"]
  },
  { 
    icon: ClipboardCheck, 
    label: "Home Inspection", 
    desc: "Professional property assessment",
    features: ["Detailed reports", "Structural analysis", "Legal verification", "Pre-purchase inspection"]
  },
  { 
    icon: UserCheck, 
    label: "Property Consultants", 
    desc: "Expert guidance for investments",
    features: ["Market analysis", "Investment strategy", "Portfolio management", "Risk assessment"]
  },
];

export default function OtherServicesPage() {
  const [popup, setPopup] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        
        <div className="container mx-auto px-4 lg:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Complete Real Estate Solutions
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6 animate-fade-in-up">
              Everything You Need <br />
              <span className="gradient-text">Under One Roof</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              From finding the perfect property to designing your dream home, we connect you with trusted professionals for every step of your real estate journey.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service, idx) => (
              <div 
                key={service.label}
                className="group bg-card rounded-2xl border border-border overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="p-8">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-heading font-bold text-xl text-foreground mb-3">
                    {service.label}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {service.desc}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    onClick={() => setPopup(service.label)}
                    className="w-full gradient-primary text-primary-foreground group-hover:opacity-90 transition-opacity"
                  >
                    Get in Touch
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our Services */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/30 via-background to-secondary/20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Why Choose Our Services?
              </h2>
              <p className="text-muted-foreground text-lg">
                We ensure quality, reliability, and excellence in every service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Verified Professionals",
                  desc: "All service providers are thoroughly vetted and verified for quality and reliability",
                  icon: UserCheck
                },
                {
                  title: "Transparent Pricing",
                  desc: "No hidden costs. Get clear quotes and competitive pricing for all services",
                  icon: ClipboardCheck
                },
                {
                  title: "End-to-End Support",
                  desc: "From consultation to completion, we're with you every step of the way",
                  icon: CheckCircle2
                }
              ].map((item, idx) => (
                <div 
                  key={item.title}
                  className="bg-card rounded-xl p-8 border border-border card-shadow text-center animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactPopup service={popup || ""} open={!!popup} onClose={() => setPopup(null)} />
    </div>
  );
}
