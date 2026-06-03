"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Building2, Target, Eye, Users, Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [builderProjectsCount, setBuilderProjectsCount] = useState(0);
  const [totalPropertiesCount, setTotalPropertiesCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // Fetch builder projects count
        const builderResponse = await fetch('/api/properties?type=new');
        const builderData = await builderResponse.json();
        if (builderData.success) {
          setBuilderProjectsCount(builderData.count);
        }
        
        // Fetch total properties count
        const totalResponse = await fetch('/api/properties');
        const totalData = await totalResponse.json();
        if (totalData.success) {
          setTotalPropertiesCount(totalData.count);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };
    
    fetchCounts();
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-white to-accent/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4 md:mb-6">
              About <span className="gradient-text">Ivanta Property</span> 
            </h1>
            <p className="text-base md:text-lg text-muted-foreground px-2">
              Rajkot's most trusted property platform, connecting dreams with reality since our inception.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4 md:mb-6">Our Story</h2>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                Ivanta Property was founded with a simple yet powerful vision: to make property transactions transparent, 
                accessible, and hassle-free for everyone in Gujarat.
              </p>
              <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                We understand that buying, selling, or renting a property is one of the most significant decisions in life. 
                That's why we've built a platform that prioritizes trust, transparency, and customer satisfaction above all else.
              </p>
              <p className="text-sm md:text-base text-muted-foreground">
                With zero platform fees and no hidden charges, we're committed to democratizing real estate access for all.
              </p>
            </div>
            <div className="relative">
              <img 
                src="/hero-bg.jpg" 
                alt="About Ivanta" 
                className="rounded-xl md:rounded-2xl shadow-2xl w-full h-[250px] md:h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 card-shadow">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 md:mb-6">
                <Target className="w-6 h-6 md:w-7 md:h-7 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3 md:mb-4">Our Mission</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                To revolutionize the real estate industry by providing a transparent, user-friendly platform 
                that empowers buyers, sellers, and renters to make informed decisions with confidence and ease.
              </p>
            </div>
            
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 card-shadow">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 md:mb-6">
                <Eye className="w-6 h-6 md:w-7 md:h-7 text-accent" />
              </div>
              <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-3 md:mb-4">Our Vision</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                To become India's most trusted and preferred real estate platform, known for integrity, 
                innovation, and exceptional customer service, while maintaining zero platform fees forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3 md:mb-4">Our Core Values</h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              These principles guide everything we do at Ivanta Property
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Building2 className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2 md:mb-3">Transparency</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                No hidden charges, no surprises. Every detail is clear and upfront.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Users className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2 md:mb-3">Customer First</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                Your satisfaction and trust are our top priorities in every interaction.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Award className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-heading font-semibold text-foreground mb-2 md:mb-3">Excellence</h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                We strive for excellence in service, technology, and customer experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">{totalPropertiesCount}+</div>
              <div className="text-white/80 text-xs md:text-sm">Total Properties</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">{builderProjectsCount}+</div>
              <div className="text-white/80 text-xs md:text-sm">Builder Projects</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">₹0</div>
              <div className="text-white/80 text-xs md:text-sm">Platform Fee</div>
            </div>
            <div>
              <div className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">100%</div>
              <div className="text-white/80 text-xs md:text-sm">Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3 md:mb-4">Why Choose Ivanta?</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: "Zero Platform Fee", desc: "Post and browse properties absolutely free" },
              { title: "Verified Listings", desc: "All properties are verified for authenticity" },
              { title: "Wide Range", desc: "From budget homes to luxury properties" },
              { title: "Expert Support", desc: "Dedicated team to assist you 24/7" },
              { title: "Easy Process", desc: "Simple, quick, and hassle-free transactions" },
              { title: "Trusted Platform", desc: "Gujarat's most reliable property portal" }
            ].map((item, idx) => (
              <div key={idx} className="bg-secondary/30 rounded-lg md:rounded-xl p-5 md:p-6 hover:shadow-lg transition-shadow">
                <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-primary mb-2 md:mb-3" />
                <h3 className="text-base md:text-lg font-heading font-semibold text-foreground mb-1.5 md:mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-xs md:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brochure Section */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3 md:mb-4">Our Brochure</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-6">Explore our catalog</p>
            
            <a
              href="/Ivanta Ventures Company Profile.pdf"
              download
              className="inline-flex items-center gap-3 gradient-primary hover:opacity-90 text-white font-semibold py-3 px-8 rounded-lg transition-opacity duration-200 shadow-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,19L8,15H10.5V12H13.5V15H16L12,19Z" />
              </svg>
              <span>Download Our Brochure</span>
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
