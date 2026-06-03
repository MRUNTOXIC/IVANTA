import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactPopupProps {
  service: string;
  open: boolean;
  onClose: () => void;
}

const ContactPopup = ({ service, open, onClose }: ContactPopupProps) => {
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true); 
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card rounded-xl card-shadow p-6 w-full max-w-md mx-4 relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-heading font-bold text-lg text-foreground mb-1">Contact {service}</h3>
        <p className="text-muted-foreground text-sm mb-5">We will call you back</p>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-2xl">✓</span>
            </div>
            <p className="font-heading font-semibold text-foreground">Thank you!</p>
            <p className="text-muted-foreground text-sm">We will get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input required type="text" placeholder="Name" className="px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input required type="tel" placeholder="Mobile Number" className="px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input required type="text" placeholder="Location" className="px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <input required type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <Button type="submit" className="gradient-primary text-primary-foreground font-semibold mt-2 hover:opacity-90 transition-opacity">
              Submit
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPopup;
