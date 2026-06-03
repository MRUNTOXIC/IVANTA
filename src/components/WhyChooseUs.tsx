"use client";

import { Gift, Eye, Sparkles, Target, CheckCircle2 } from "lucide-react";

const features = [
  { 
    icon: Gift, 
    title: "Free Service", 
    desc: "No hidden charges. Our core services are completely free for buyers and renters."
  },
  { 
    icon: Eye, 
    title: "Fully Transparent", 
    desc: "Every detail upfront — pricing, documentation, and property history."
  },
  { 
    icon: Sparkles, 
    title: "Seamless Experience", 
    desc: "From search to keys — a smooth, modern user experience at every step."
  },
  { 
    icon: Target, 
    title: "One Stop Solution", 
    desc: "Buy, rent, loan, services — everything you need under one roof."
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white relative overflow-hidden">
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
            Our Commitment
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-2 sm:mb-3 md:mb-4 px-2">
            Why Choose Ivanta
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg px-4">
            Experience the difference with our customer-first approach
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-border card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
            >
              
              <div className="relative z-10">
                {/* Icon with gradient - matching loan section */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-primary-foreground" />
                </div>
                
                {/* Content */}
                <h3 className="font-heading font-bold text-base sm:text-lg md:text-xl text-foreground mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default WhyChooseUs;
