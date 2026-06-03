"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bed, Maximize, Heart, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFavorites } from "@/contexts/FavoritesContext";

interface PropertyCardProps {
  property: {
    _id: string;
    slug?: string;
    title: string;
    price: string;
    priceFrom?: string;
    priceTo?: string;
    propertyType: string;
    subType: string;
    area: string;
    city: string;
    beds?: string[] | string;
    baths?: string;
    sqft: string;
    badge?: string;
    foodAvailable?: boolean;
    acAvailable?: boolean;
    isSold?: boolean;
    isVerified?: boolean;
    images: string[];
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isFavorite, addFavorite, removeFavorite, isAuthenticated, isLoading: isAuthLoading } = useFavorites();
  const location = `${property.area}, ${property.city}`;
  const image = property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg';

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated && !isAuthLoading) {
      toast.error('Please login to save favorites');
      router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setIsLoading(true);
    try {
      const isFav = isFavorite(property._id);
      if (isFav) {
        const success = await removeFavorite(property._id);
        if (success) toast.success('Removed from favorites');
        else toast.error('Failed to remove from favorites');
      } else {
        const success = await addFavorite(property._id);
        if (success) toast.success('Added to favorites');
        else toast.error('Failed to add to favorites');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (property.isSold) {
      e.preventDefault();
      toast.error('This property has been sold', {
        description: 'Property details are not available for sold properties.',
        duration: 3000,
      });
      return;
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('propertyListingPage', window.location.pathname + window.location.search);
      sessionStorage.setItem('propertyListingScroll', window.scrollY.toString());
    }
  };

  return (
    <Link
      href={property.isSold ? '#' : `/property/${property.slug || property._id}`}
      onClick={handleCardClick}
      className={`group block bg-card rounded-lg sm:rounded-xl overflow-hidden card-shadow hover-lift w-full ${property.isSold ? 'opacity-75 cursor-not-allowed' : ''}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={image}
          alt={property.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
        />
        {property.badge && !property.isSold && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 gradient-primary text-primary-foreground text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
            {property.badge}
          </span>
        )}
        
        {property.isVerified && !property.isSold && (
          <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-green-500 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
        
        {property.isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-orange-600 text-white text-sm sm:text-lg font-bold px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg">
              SOLD
            </span>
          </div>
        )}
        
        {/* Favorite Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white shadow-md"
          onClick={toggleFavorite}
          disabled={isLoading}
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
              isFavorite(property._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
            }`}
          />
        </Button>
        
        {/* Image Counter */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-black/60 text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
            1 / {property.images.length}
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 lg:p-4">
        {!property.price && !property.priceFrom ? (
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
            <p className="text-sm sm:text-base lg:text-lg font-heading font-bold text-primary">
              Call for Price
            </p>
          </div>
        ) : (
          <p className="text-sm sm:text-base lg:text-lg font-heading font-bold text-primary mb-0.5 sm:mb-1">
            {property.priceFrom
              ? <>&#8377;{property.priceFrom} &ndash; &#8377;{property.priceTo || '...'}</>
              : <>&#8377;{property.price}</>}
          </p>
        )}
        <h3 className="font-heading font-semibold text-card-foreground text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-1">
          {property.title}
        </h3>
        <p className="flex items-center gap-1 text-muted-foreground text-[10px] sm:text-xs mb-2 sm:mb-3 line-clamp-1">
          <MapPin className="w-3 h-3 flex-shrink-0" /> {location}
        </p>
        
        {/* For PG/Hostel properties */}
        {property.propertyType === 'pg' ? (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs border-t border-border pt-2 sm:pt-3">
            {property.subType && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-primary/10 text-primary rounded-md font-medium">
                {property.subType}
              </span>
            )}
            {property.foodAvailable && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-100 text-green-700 rounded-md font-medium">
                🍽️ Food
              </span>
            )}
            {property.acAvailable && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                ❄️ AC
              </span>
            )}
          </div>
        ) : (
          /* For other property types */
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs text-muted-foreground border-t border-border pt-2 sm:pt-3">
            {property.beds && property.propertyType !== 'commercial' && property.propertyType !== 'plot' && <span className="flex items-center gap-0.5 sm:gap-1"><Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /> {Array.isArray(property.beds) ? property.beds.join(', ') : property.beds}</span>}
            <span className="flex items-center gap-0.5 sm:gap-1"><Maximize className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /> {property.sqft}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default PropertyCard;
