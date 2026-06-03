"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Home, Landmark, RefreshCw, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ContactPopup from "@/components/ContactPopup";

const loanTypes = [
  {
    icon: Building2,
    title: "Project Loan",
    description: "Financing for real estate development projects with flexible terms and competitive rates.",
    features: [
      "Up to 80% project financing",
      "Flexible repayment options",
      "Quick approval process",
      "Competitive interest rates",
      "Minimal documentation"
    ],
    color: "primary"
  },
  {
    icon: Home,
    title: "Home Loan",
    description: "Make your dream home a reality with our affordable home loan solutions.",
    features: [
      "Up to 90% property value",
      "Tenure up to 30 years",
      "Low interest rates",
      "Tax benefits available",
      "Easy EMI options"
    ],
    color: "accent"
  },
  {
    icon: Landmark,
    title: "Loan Against Property",
    description: "Unlock the value of your property for business or personal needs.",
    features: [
      "High loan amounts",
      "Lower interest rates",
      "Flexible end-use",
      "Long repayment tenure",
      "Minimal processing fees"
    ],
    color: "primary"
  },
  {
    icon: RefreshCw,
    title: "Balance Transfer",
    description: "Transfer your existing loan to get better rates and save on interest.",
    features: [
      "Lower interest rates",
      "Reduced EMI burden",
      "Top-up loan facility",
      "Quick processing",
      "No prepayment charges"
    ],
    color: "accent"
  }
];

export default function LoansPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState("");

  const handleApplyNow = (loanType: string) => {
    setSelectedLoan(loanType);
    setIsContactOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-white to-accent/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6">
              Loan <span className="gradient-text">Solutions</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
              Get the best loan options tailored to your needs with competitive rates and hassle-free processing.
            </p>
            <Button 
              onClick={() => setIsContactOpen(true)}
              className="gradient-primary text-primary-foreground px-6 py-5 md:px-8 md:py-6 text-base md:text-lg font-semibold"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Get Expert Advice
            </Button>
          </div>
        </div>
      </section>

      {/* Loan Types */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3 md:mb-4">Our Loan Products</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Choose from our range of loan products designed to meet your financial requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {loanTypes.map((loan, idx) => {
              const Icon = loan.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 card-shadow hover:card-shadow-hover transition-all border border-border"
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full ${loan.color === 'primary' ? 'bg-primary/10' : 'bg-accent/10'} flex items-center justify-center mb-4 md:mb-6`}>
                    <Icon className={`w-7 h-7 md:w-8 md:h-8 ${loan.color === 'primary' ? 'text-primary' : 'text-accent'}`} />
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-2 md:mb-3">{loan.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-5 md:mb-6">{loan.description}</p>
                  
                  <div className="space-y-2.5 md:space-y-3 mb-5 md:mb-6">
                    {loan.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex items-start gap-2.5 md:gap-3">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs md:text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => handleApplyNow(loan.title)}
                    className="w-full gradient-primary text-primary-foreground font-semibold"
                  >
                    Apply Now
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Loans */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3 md:mb-4">Why Choose Our Loan Services?</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {[
              { title: "Quick Approval", desc: "Get loan approval in as little as 24-48 hours" },
              { title: "Competitive Rates", desc: "Best interest rates in the market" },
              { title: "Flexible Terms", desc: "Customized repayment plans to suit your needs" },
              { title: "Minimal Documentation", desc: "Simple and hassle-free documentation process" },
              { title: "Expert Guidance", desc: "Dedicated loan advisors to assist you" },
              { title: "Transparent Process", desc: "No hidden charges or surprise fees" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg md:rounded-xl p-5 md:p-6 text-center">
                <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1.5 md:mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <ContactPopup 
        open={isContactOpen} 
        onClose={() => setIsContactOpen(false)}
        service={selectedLoan || "Loan Inquiry"}
      />
      
      <Footer />
    </div>
  );
}
