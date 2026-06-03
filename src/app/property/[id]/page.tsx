"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bed, Bath, Maximize, ArrowLeft, Phone, MessageCircle, ChevronLeft, ChevronRight, Heart, Share2, Instagram, Facebook, Youtube, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useFavorites } from "@/contexts/FavoritesContext";
import { getAmenityIcon } from "@/lib/amenityIcons";

// ─── Suggested Properties helpers ────────────────────────────────────────────

function scoreSimilarity(current: any, candidate: any): number {
  let score = 0;

  // Same area (highest weight)
  if (current.area && candidate.area &&
      current.area.toLowerCase() === candidate.area.toLowerCase()) score += 40;

  // Same property type
  if (current.propertyType && candidate.propertyType &&
      current.propertyType === candidate.propertyType) score += 20;

  // Similar beds (any overlap in beds array)
  if (current.beds?.length && candidate.beds?.length) {
    const currentBeds = new Set(current.beds.map((b: string) => b.toLowerCase()));
    const overlap = candidate.beds.some((b: string) => currentBeds.has(b.toLowerCase()));
    if (overlap) score += 15;
  }

  // Similar sqft (within ±30%)
  const parseSqft = (s: string) => parseFloat((s || '').replace(/[^0-9.]/g, ''));
  const curSqft = parseSqft(current.sqft);
  const canSqft = parseSqft(candidate.sqft);
  if (curSqft > 0 && canSqft > 0) {
    const ratio = Math.min(curSqft, canSqft) / Math.max(curSqft, canSqft);
    if (ratio >= 0.7) score += 15;
  }

  // Shared amenities
  if (current.amenities?.length && candidate.amenities?.length) {
    const currentSet = new Set(current.amenities.map((a: string) => a.toLowerCase()));
    const shared = candidate.amenities.filter((a: string) => currentSet.has(a.toLowerCase())).length;
    score += Math.min(shared * 2, 10); // up to 10 pts
  }

  return score;
}

function SuggestedProperties({ current }: { current: any }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!current) return;
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/properties?type=${current.propertyType}&limit=50`);
        const result = await res.json();
        if (result.success) {
          const scored = (result.data as any[])
            .filter((p) => p._id !== current._id)
            .map((p) => ({ ...p, _score: scoreSimilarity(current, p) }))
            .filter((p) => p._score > 0)
            .sort((a, b) => b._score - a._score)
            .slice(0, 6);
          setSuggestions(scored);
        }
      } catch {
        // silently fail — suggestions are non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [current?._id]);

  if (loading) {
    return (
      <div className="mt-4 sm:mt-6 lg:mt-8 bg-card rounded-xl card-shadow p-4 sm:p-6">
        <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-4 sm:mb-6">You Might Like These Too</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border overflow-hidden animate-pulse">
              <div className="aspect-video bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 sm:mt-6 lg:mt-8 bg-card rounded-xl card-shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg">You Might Like These Too</h2>
        <Link
          href={`/properties?type=${current.propertyType}`}
          className="text-sm text-primary hover:underline font-medium"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((prop) => {
          const image = prop.images?.[0] || '/placeholder.svg';
          const location = [prop.area, prop.city].filter(Boolean).join(', ');
          const slug = prop.slug || prop._id;
          const beds = Array.isArray(prop.beds) ? prop.beds.join(', ') : prop.beds;

          return (
            <Link
              key={prop._id}
              href={`/property/${slug}`}
              className="group rounded-xl border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all bg-background"
            >
              {/* Image */}
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={image}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {prop.badge && (
                  <span className="absolute top-2 left-2 gradient-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full">
                    {prop.badge}
                  </span>
                )}
                <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full capitalize">
                  {prop.propertyType}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4">
                {/* Price */}
                <p className="text-base font-bold text-primary mb-1">
                  {prop.priceFrom
                    ? `₹${prop.priceFrom} – ₹${prop.priceTo || '...'}`
                    : prop.price
                    ? `₹${prop.price}`
                    : 'Call for Price'}
                </p>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {prop.title}
                </h3>

                {/* Location */}
                <p className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="line-clamp-1">{location}</span>
                </p>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {beds && prop.propertyType !== 'commercial' && prop.propertyType !== 'plot' && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" /> {beds}
                    </span>
                  )}
                  {prop.baths && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" /> {prop.baths}
                    </span>
                  )}
                  {prop.sqft && (
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3 h-3" /> {prop.sqft}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [referrer, setReferrer] = useState<string>('/properties');
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [mapActive, setMapActive] = useState(false);
  const { isFavorite, addFavorite, removeFavorite, isAuthenticated, isLoading: isAuthLoading } = useFavorites();

  const handleShare = async () => {
    const shareData = {
      title: property?.title || 'Property',
      text: `Check out this property: ${property?.title}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Link copied to clipboard!');
        } catch (clipboardError) {
          toast.error('Failed to share');
        }
      }
    }
  };

  useEffect(() => {
    const savedReferrer = sessionStorage.getItem('propertyListingPage');
    if (savedReferrer) {
      setReferrer(savedReferrer);
    } else if (document.referrer) {
      const referrerUrl = new URL(document.referrer);
      if (referrerUrl.pathname.includes('/properties')) {
        setReferrer(document.referrer.replace(referrerUrl.origin, ''));
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`);
        const result = await response.json();
        if (result.success) {
          setProperty(result.data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const toggleFavorite = async () => {
    if (!property) return;
    
    if (!isAuthenticated && !isAuthLoading) {
      toast.error('Please login to save favorites');
      router.push(`/login?returnTo=/property/${id}`);
      return;
    }
    
    setIsLoadingFavorite(true);
    try {
      const isFav = isFavorite(property._id);
      
      if (isFav) {
        const success = await removeFavorite(property._id);
        if (success) {
          toast.success('Removed from favorites');
        } else {
          toast.error('Failed to remove from favorites');
        }
      } else {
        const success = await addFavorite(property._id);
        if (success) {
          toast.success('Added to favorites');
        } else {
          toast.error('Failed to add to favorites');
        }
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const handleAuthenticatedAction = (action: () => void, actionName: string) => {
    if (!isAuthenticated && !isAuthLoading) {
      toast.error(`Please login to ${actionName}`);
      router.push(`/login?returnTo=/property/${id}`);
      return;
    }
    action();
  };

  const handlePrevImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
      setImgLoaded(false);
    }
  };

  const handleNextImage = () => {
    if (property?.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
      setImgLoaded(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const openFullscreen = () => {
    setIsFullscreenOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div>Loading property details...</div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">Property Not Found</h1>
          <Link href="/properties"><Button variant="outline">Back to Listings</Button></Link>
        </div>
      </div>
    );
  }

  const fullAddress = [
    property.street1,
    property.street2,
    property.street3,
    property.street4,
    property.area,
    property.city,
    property.district,
    property.state,
    property.pincode
  ].filter(Boolean).join(', ');
  const images = property.images && property.images.length > 0 ? property.images : ['/placeholder.svg'];
  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
        <Link href={referrer} className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" /> Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Image with Navigation */}
          <div className="lg:col-span-2">
            <div 
              className="relative rounded-xl overflow-hidden aspect-video bg-white group cursor-pointer lg:cursor-default"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  openFullscreen();
                }
              }}
            >
              {!imgLoaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
              <img
                src={currentImage}
                alt={property.title}
                onLoad={() => setImgLoaded(true)}
                className={`w-full h-full object-contain ${imgLoaded ? "opacity-100" : "opacity-0"} transition-opacity`}
              />
              {property.badge && (
                <span className="absolute top-4 left-4 gradient-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full">
                  {property.badge}
                </span>
              )}
              
              {/* Favorite Button */}
              <div className="absolute top-4 right-4">
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={toggleFavorite}
                  disabled={isLoadingFavorite}
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      property && isFavorite(property._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                    }`}
                  />
                </Button>
              </div>
              
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2 mt-4">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setImgLoaded(false);
                    }}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all bg-white ${
                      index === currentImageIndex
                        ? 'border-primary scale-105'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="bg-card rounded-xl card-shadow p-4 sm:p-6 lg:sticky lg:top-24 h-fit">
            <div className="mb-4 sm:mb-6">
              {!property.price && !property.priceFrom ? (
                <Button 
                  className="gradient-primary text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity text-base sm:text-lg h-11 sm:h-12 mb-3"
                  onClick={() => handleAuthenticatedAction(
                    () => property.contactPhone && window.open(`tel:${property.contactPhone}`, '_self'),
                    'contact owner'
                  )}
                  disabled={!property.contactPhone}
                >
                  <Phone className="w-5 h-5" /> Call for Price
                </Button>
              ) : (
                <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-primary mb-2">
                  {property.priceFrom
                    ? (
                      <span className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                        <span>&#8377;{property.priceFrom}</span>
                        <span className="text-base sm:text-xl text-muted-foreground">to</span>
                        <span>&#8377;{property.priceTo || '...'}</span>
                      </span>
                    )
                    : <span>&#8377;{property.price}</span>}
                </p>
              )}
              <h1 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-3">{property.title}</h1>
              <p className="flex items-start gap-2 text-muted-foreground text-xs sm:text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> 
                <span className="line-clamp-2">{fullAddress}</span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {property.propertyType === 'pg' ? (
                /* PG/Hostel specific info */
                <>
                  {property.subType && (
                    <div className="col-span-3 text-center p-2 sm:p-3 bg-secondary rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-foreground">Available For: {property.subType}</span>
                    </div>
                  )}
                  {property.foodAvailable !== undefined && (
                    <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                      <span className="text-xl sm:text-2xl mb-1 block">🍽️</span>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground block">{property.foodAvailable ? 'Food' : 'No Food'}</span>
                    </div>
                  )}
                  {property.acAvailable !== undefined && (
                    <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                      <span className="text-xl sm:text-2xl mb-1 block">❄️</span>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground block">{property.acAvailable ? 'AC' : 'No AC'}</span>
                    </div>
                  )}
                  <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                    <span className="text-[10px] sm:text-xs font-medium text-foreground block">{property.sqft}</span>
                  </div>
                </>
              ) : (
                /* Other property types */
                <>
                  {property.beds && property.beds.length > 0 && property.propertyType !== 'commercial' && property.propertyType !== 'plot' && (
                    <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                      <Bed className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                      <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground block">{Array.isArray(property.beds) ? property.beds.join(', ') : property.beds}</span>
                    </div>
                  )}
                  {property.baths && (
                    <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                      <Bath className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                      <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground block">{property.baths}</span>
                    </div>
                  )}
                  <div className="text-center p-2 sm:p-3 bg-secondary rounded-lg">
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 text-primary" />
                    <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground block">{property.sqft}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <Button 
                className="gradient-primary text-primary-foreground font-semibold gap-2 hover:opacity-90 transition-opacity text-sm sm:text-base h-10 sm:h-11"
                onClick={() => handleAuthenticatedAction(
                  () => property.contactPhone && window.open(`tel:${property.contactPhone}`, '_self'),
                  'contact owner'
                )}
                disabled={!property.contactPhone}
              >
                <Phone className="w-4 h-4" /> <span className="hidden sm:inline">Contact Owner</span><span className="sm:hidden">Call</span>
              </Button>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 transition-colors text-sm sm:text-base h-10 sm:h-11"
                onClick={() => handleAuthenticatedAction(
                  () => property.whatsappNumber && window.open(`https://wa.me/${property.whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank'),
                  'use WhatsApp'
                )}
                disabled={!property.whatsappNumber}
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </Button>

              {/* Download Brochure Button */}
              {property.brochureUrl && (
                <Button 
                  variant="outline" 
                  className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white gap-2 transition-colors text-sm sm:text-base h-10 sm:h-11"
                  onClick={() => handleAuthenticatedAction(
                    () => window.open(`/api/download-brochure?url=${encodeURIComponent(property.brochureUrl)}&title=${encodeURIComponent(property.title)}`, '_blank'),
                    'download brochure'
                  )}
                >
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download Brochure</span><span className="sm:hidden">Brochure</span>
                </Button>
              )}

              {/* Social Media Links */}
              {(property.instagramLink || property.facebookLink || property.youtubeLink) && (
                <div className="flex gap-2 pt-1 sm:pt-2">
                  {property.instagramLink && (
                    <button
                      onClick={() => handleAuthenticatedAction(
                        () => window.open(property.instagramLink, '_blank', 'noopener,noreferrer'),
                        'view Instagram'
                      )}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                    >
                      <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                    </button>
                  )}
                  {property.facebookLink && (
                    <button
                      onClick={() => handleAuthenticatedAction(
                        () => window.open(property.facebookLink, '_blank', 'noopener,noreferrer'),
                        'view Facebook'
                      )}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                    >
                      <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </button>
                  )}
                  {property.youtubeLink && (
                    <button
                      onClick={() => handleAuthenticatedAction(
                        () => window.open(property.youtubeLink, '_blank', 'noopener,noreferrer'),
                        'view YouTube'
                      )}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                    >
                      <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 sm:mt-6 lg:mt-8 bg-card rounded-xl card-shadow p-4 sm:p-6">
          <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3 sm:mb-4">About this property</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
          
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
              <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-3 sm:mb-4">Amenities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {property.amenities.map((amenity: string, index: number) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Project Details */}
        {(property.projectStartDate || property.projectEndDate || property.possessionDate || 
          property.totalFloors || property.flatsPerFloor || property.totalWings || 
          property.parkingFourWheeler !== undefined || property.parkingTwoWheeler !== undefined || 
          property.totalSoldFlats !== undefined || property.rera || property.facing || 
          (property.landmarks && property.landmarks.length > 0)) && (
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-card rounded-xl card-shadow p-4 sm:p-6">
            <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-4 sm:mb-6">Property Details</h2>
            <div className="grid grid-cols-1 gap-0">
              {property.projectStartDate && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Project Start Date</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.projectStartDate}</span>
                </div>
              )}
              {property.projectEndDate && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Project End Date</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.projectEndDate}</span>
                </div>
              )}
              {property.possessionDate && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Possession Date</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.possessionDate}</span>
                </div>
              )}
              {property.totalFloors && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Total Floors</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.totalFloors}</span>
                </div>
              )}
              {property.flatsPerFloor && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Flats per Floor</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.flatsPerFloor}</span>
                </div>
              )}
              {property.totalWings && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Total Wings</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.totalWings}</span>
                </div>
              )}
              {(property.totalFloors && property.flatsPerFloor && property.totalWings) && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Total Flats</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.totalFloors * property.flatsPerFloor * property.totalWings}</span>
                </div>
              )}
              {property.totalSoldFlats !== undefined && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Sold Flats</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.totalSoldFlats}</span>
                </div>
              )}
              {(property.totalFloors && property.flatsPerFloor && property.totalWings && property.totalSoldFlats !== undefined) && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Remaining Flats</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{(property.totalFloors * property.flatsPerFloor * property.totalWings) - property.totalSoldFlats}</span>
                </div>
              )}
              {property.parkingFourWheeler !== undefined && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">4 Wheeler Parking</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.parkingFourWheeler}</span>
                </div>
              )}
              {property.parkingTwoWheeler !== undefined && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">2 Wheeler Parking</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.parkingTwoWheeler}</span>
                </div>
              )}
              {property.rera && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">RERA</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right break-all">{property.rera}</span>
                </div>
              )}
              {property.facing && (
                <div className="flex justify-between items-center gap-4 py-3 sm:py-4 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Facing</span>
                  <span className="text-sm sm:text-base font-medium text-foreground text-right">{property.facing}</span>
                </div>
              )}
            </div>
            
            {property.landmarks && property.landmarks.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border">
                <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-4">Nearby Landmarks</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.landmarks.map((landmark: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{landmark.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary ml-2 flex-shrink-0">{landmark.distance} {landmark.distance && !landmark.distance.toLowerCase().includes('min') ? 'Minutes' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Location Map */}
        {property.latitude && property.longitude && (
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-card rounded-xl card-shadow p-4 sm:p-6">
            <h2 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-4 sm:mb-6">Location</h2>
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[450px] rounded-xl overflow-hidden border-2 border-border mb-4 sm:mb-6 shadow-lg">
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(property.longitude) - 0.01},${parseFloat(property.latitude) - 0.01},${parseFloat(property.longitude) + 0.01},${parseFloat(property.latitude) + 0.01}&layer=mapnik&marker=${property.latitude},${property.longitude}`}
                className="w-full h-full border-0"
                title="Property Location"
              />
              {/* Scroll-blocking overlay — tap to activate map interaction */}
              {!mapActive && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer flex items-center justify-center"
                  onClick={() => setMapActive(true)}
                >
                  <span className="bg-black/60 text-white text-sm font-medium px-4 py-2 rounded-full pointer-events-none select-none">
                    Tap to interact with map
                  </span>
                </div>
              )}
              {/* Deactivate map when user scrolls away — click outside resets */}
              {mapActive && (
                <button
                  className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                  onClick={() => setMapActive(false)}
                >
                  ✕ Done
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="gradient-primary text-primary-foreground font-semibold gap-2 flex-1 text-sm sm:text-base h-11 sm:h-12"
                onClick={() => handleAuthenticatedAction(
                  () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`, '_blank', 'noopener,noreferrer'),
                  'get directions'
                )}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> Get Directions
              </Button>
              <Button 
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 flex-1 text-sm sm:text-base h-11 sm:h-12"
                onClick={() => handleAuthenticatedAction(
                  () => window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, '_blank', 'noopener,noreferrer'),
                  'view on map'
                )}
              >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> View on Google Maps
              </Button>
            </div>
          </div>
        )}

        {/* Suggested Properties */}
        <SuggestedProperties current={property} />

      </main>

      {/* Floating Action Buttons - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-card border-t border-border p-3 z-40 shadow-2xl">
        <div className="container mx-auto flex gap-2">
          <Button
            className="flex-1 gradient-primary text-primary-foreground font-semibold gap-2 h-12"
            onClick={() => handleAuthenticatedAction(
              () => property.contactPhone && window.open(`tel:${property.contactPhone}`, '_self'),
              'contact owner'
            )}
            disabled={!property.contactPhone}
          >
            <Phone className="w-4 h-4" /> Call
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground gap-2 h-12"
            onClick={() => handleAuthenticatedAction(
              () => property.whatsappNumber && window.open(`https://wa.me/${property.whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank'),
              'use WhatsApp'
            )}
            disabled={!property.whatsappNumber}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="w-12 h-12 border-primary"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 text-primary" />
          </Button>
        </div>
      </div>

      {/* Floating Share Button - Desktop */}
      <Button
        size="icon"
        className="hidden lg:flex fixed bottom-6 right-6 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-2xl hover:scale-110 transition-transform z-50"
        onClick={handleShare}
      >
        <Share2 className="w-6 h-6" />
      </Button>

      {/* Mobile Fullscreen Image Viewer */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-black/90">
            <div className="text-white text-sm font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
            <button
              onClick={closeFullscreen}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Image Container */}
          <div 
            className="flex-1 relative flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={currentImage}
              alt={property.title}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="p-4 bg-black/90 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setImgLoaded(false);
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      index === currentImageIndex
                        ? 'border-white scale-110'
                        : 'border-white/30'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
