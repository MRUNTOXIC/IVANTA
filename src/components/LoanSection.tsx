"use client";

import { Home, Landmark, Briefcase, CheckCircle2, ArrowRight, TrendingDown, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ContactPopup from "./ContactPopup";

const loans = [
  { 
    icon: Home, 
    title: "Home Loan", 
    desc: "Get the best home loan rates with easy EMI options and quick approval.",
    features: ["Up to 90% funding", "Tenure up to 30 years", "Minimal documentation"]
  },
  { 
    icon: Landmark, 
    title: "Loan Against Property", 
    desc: "Unlock the value of your property with competitive interest rates.",
    features: ["Quick disbursal", "Flexible repayment", "No end-use restriction"]
  },
  { 
    icon: Briefcase, 
    title: "Business Loan", 
    desc: "Fuel your business growth with flexible loan options tailored for you.",
    features: ["Collateral-free options", "Fast approval", "Working capital support"]
  },
];

const benefits = [
  { icon: TrendingDown, label: "Lowest Interest Rates", desc: "Starting from 8.5% p.a." },
  { icon: Clock, label: "Quick Approval", desc: "Get approved in 48 hours" },
  { icon: Shield, label: "Secure Process", desc: "100% safe & transparent" },
];

const LoanSection = () => {
  const [popup, setPopup] = useState(false);

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <Landmark className="w-4 h-4" />
            Financial Solutions
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Easy Property Loan
          </h2>
          <p className="text-muted-foreground text-lg">
            Quick approvals, competitive rates, hassle-free process — get the funding you need
          </p>
        </div>

        {/* Loan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {loans.map((loan) => (
            <div 
              key={loan.title} 
              className="group bg-white rounded-2xl p-8 border-2 border-border hover:border-primary/30 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <loan.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              
              {/* Content */}
              <h3 className="font-heading font-bold text-xl text-foreground mb-3">
                {loan.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {loan.desc}
              </p>
              
              {/* Features */}
              <ul className="space-y-2 mb-6">
                {loan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA */}
              <button 
                onClick={() => setPopup(true)}
                className="w-full flex items-center justify-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Benefits Bar */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-border card-shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0 shadow-sm">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-foreground mb-1">
                      {benefit.label}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Button 
            onClick={() => setPopup(true)}
            size="lg"
            className="gradient-primary text-primary-foreground font-semibold px-8 hover:opacity-90 transition-opacity"
          >
            Get Loan Assistance
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <ContactPopup service="Loan Assistance" open={popup} onClose={() => setPopup(false)} />
    </section>
  );
};

export default LoanSection;
