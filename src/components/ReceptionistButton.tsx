"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";
import RequirementForm from "@/components/RequirementForm";

const ReceptionistButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
        aria-label="Contact Receptionist"
      >
        <Headphones className="w-8 h-8 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
      </button>

      {/* Requirement Form Popup */}
      <RequirementForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ReceptionistButton;
