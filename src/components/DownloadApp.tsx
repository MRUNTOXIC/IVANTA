"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

const DownloadApp = () => {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Download Our Mobile App
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Get the best property browsing experience on your mobile device
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center max-w-xl mx-auto">
            <a
              href="https://play.google.com/store/apps/details?id=com.ivanta.property&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-primary hover:opacity-90 text-white font-semibold py-2.5 px-5 rounded-lg transition-opacity duration-200 flex items-center justify-center space-x-2.5 shadow-lg w-full sm:w-auto"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] opacity-90 leading-tight">Download on</p>
                <p className="text-sm font-bold leading-tight">Google Play</p>
              </div>
            </a>

            <button
              onClick={() => setShowDialog(true)}
              className="gradient-primary hover:opacity-90 text-white font-semibold py-2.5 px-5 rounded-lg transition-opacity duration-200 flex items-center justify-center space-x-2.5 shadow-lg w-full sm:w-auto"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
              </svg>
              <div className="text-left">
                <p className="text-[10px] opacity-90 leading-tight">Download on</p>
                <p className="text-sm font-bold leading-tight">App Store</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md w-[90vw] rounded-xl">
          <DialogHeader className="space-y-3">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              iOS App Under Development
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Our iOS app is currently under development. Please use our website for the best experience.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Link
              href="/"
              className="w-full gradient-primary hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-opacity duration-200 flex items-center justify-center space-x-2 shadow-lg"
              onClick={() => setShowDialog(false)}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
              </svg>
              <span>Visit Website</span>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DownloadApp;
