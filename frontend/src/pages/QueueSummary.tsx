import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Tag, ShoppingCart, Clock, Star, Wallet, ChevronRight, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useProfileCompletion } from "../hooks/useProfileCompletion";
import BookingDetailsModal from "../components/BookingDetailsModal";
import BookingSuccessAnimation from "../components/BookingSuccessAnimation";
import { PhoneVerificationModal } from "../components/PhoneVerificationModal";
import { api } from "../lib/api";
import type { Offer } from "../types";

export default function QueueSummary() {
  const [, setLocation] = useLocation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { user } = useAuth();
  const { items, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>('cash-at-salon');
  const {
    isModalOpen,
    isPhoneModalOpen,
    requireProfileCompletion,
    completeProfile,
    completePhoneVerification,
    cancelProfileCompletion
  } = useProfileCompletion();

  // Fetch offers for the salon
  const { data: availableOffers = [], isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ['salonOffers', items[0]?.salonId],
    queryFn: () => {
      if (!items[0]?.salonId) return [];
      return api.offers.getBySalon(items[0].salonId);
    },
    enabled: !!items[0]?.salonId,
  });

  const subtotal = getTotalPrice();
  const discountAmount = selectedOffer ? (subtotal * selectedOffer.discount) / 100 : 0;

  // Calculate loyalty discount
  const salonId = items[0]?.salonId;
  const salonPoints = user?.salonLoyaltyPoints?.[salonId] || 0;
  const loyaltyDiscount = salonPoints >= 100 ? 20 : salonPoints >= 50 ? 10 : 0;
  const loyaltyDiscountAmount = loyaltyDiscount > 0 ? (subtotal * loyaltyDiscount) / 100 : 0;

  // Round to nearest integer to avoid floating point issues
  const finalTotal = Math.round(subtotal - discountAmount - loyaltyDiscountAmount);

  const joinQueueMutation = useMutation({
    mutationFn: async () => {
      if (!user || items.length === 0) throw new Error("Invalid request");

      // Send multiple services with total pricing
      const serviceIds = items.map(item => item.service.id);
      const appliedOfferIds = selectedOffer ? [selectedOffer.id] : [];

      return api.queue.join({
        userId: user.id,
        salonId: items[0].salonId,
        serviceIds: serviceIds,
        totalPrice: finalTotal, // Send as number, schema will convert to string
        appliedOffers: appliedOfferIds
      });
    },
    onSuccess: () => {
      // Show success animation
      setShowSuccessAnimation(true);
    },
    onError: (error) => {
      toast({
        title: "Failed to join queue",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  const handleSuccessAnimationComplete = () => {
    toast({
      title: "Successfully joined queue!",
      description: `You've been added to the queue with ${items.length} service${items.length > 1 ? 's' : ''}.`,
    });
    clearCart();
    setLocation('/queue');
  };

  const handleConfirmAndJoin = () => {
    if (!user) {
      setLocation('/auth');
      return;
    }

    // Use profile completion hook to ensure user has complete profile
    requireProfileCompletion(() => {
      joinQueueMutation.mutate();
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-teal-100 shadow-xl">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-teal-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8 text-lg">Discover amazing services and add them to your cart</p>
            <Button
              onClick={() => setLocation('/')}
              className="w-full min-h-[48px] bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-base rounded-xl shadow-lg"
            >
              Browse Salons
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <BookingSuccessAnimation
          onComplete={handleSuccessAnimationComplete}
          salonName={items[0]?.salonName}
          serviceCount={items.length}
        />
      )}

      <div className="min-h-screen bg-gray-50 pb-48 md:pb-8">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-40 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation(`/salon/${items[0]?.salonId}`)}
                  className="hover:bg-white/20 text-white rounded-lg h-10 w-10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-lg font-bold">
                    {items.length} Service{items.length > 1 ? 's' : ''} in Cart
                  </h1>
                  <p className="text-sm text-white/90">You Pay : ₹{Math.round(finalTotal)}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/salon/${items[0]?.salonId}`)}
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-teal-600 font-semibold rounded-lg px-4"
              >
                EDIT
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-4">

          {/* Selected Services */}
          <div className="bg-white rounded-lg shadow-sm mb-3">
            {items.map((item, index) => (
              <div
                key={item.service.id}
                className={`p-4 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1 capitalize">
                      {item.service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Clock className="w-3 h-3" />
                      <span>{item.service.duration} min</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.service.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Apply Coupon Button */}
          <button
            onClick={() => setShowCouponModal(true)}
            className="w-full bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <Tag className="w-5 h-5 text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900">Apply Coupon</p>
                {selectedOffer && (
                  <p className="text-xs text-green-600 font-medium">
                    {selectedOffer.title} applied • Save ₹{Math.round(discountAmount)}
                  </p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          {/* Bill Summary */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sub Total</span>
                <span className="text-sm font-semibold text-gray-900">₹ {Math.round(subtotal)}</span>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discount</span>
                <span className="text-sm font-semibold text-green-600">
                  {selectedOffer || loyaltyDiscount > 0 ? `-₹ ${Math.round(discountAmount + loyaltyDiscountAmount)}` : '0.00'}
                </span>
              </div>

              {/* Loyalty Discount */}
              {loyaltyDiscount > 0 && (
                <div className="flex items-center justify-between text-xs text-amber-600 bg-amber-50 -mx-4 px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>Loyalty Rewards ({loyaltyDiscount}%)</span>
                  </div>
                  <span className="font-semibold">-₹{Math.round(loyaltyDiscountAmount)}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2"></div>

              {/* Grand Total */}
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Grand Total</span>
                <span className="text-base font-bold text-gray-900">₹ {Math.round(finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Section - Payment & Total */}
          {!showSuccessAnimation && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 pb-safe md:pb-0">
            <div className="max-w-3xl mx-auto">
              {/* Payment Method */}
              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">Pay ₹{Math.round(finalTotal)}</h3>
                        <p className="text-xs text-gray-500">via Cash / UPI at Salon</p>
                      </div>
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        className="text-teal-600 font-semibold text-sm hover:underline"
                      >
                        CHANGE
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <div className="px-4 pb-4 pt-2">
                <Button
                  onClick={handleConfirmAndJoin}
                  disabled={joinQueueMutation.isPending}
                  className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md uppercase tracking-wide"
                >
                  {joinQueueMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>Confirm and Join </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
          )}

          {/* Profile Completion Modal */}
          <BookingDetailsModal
            isOpen={isModalOpen}
            onComplete={completeProfile}
            onCancel={cancelProfileCompletion}
            salonName={items[0]?.salonName || "the salon"}
          />

          {/* Phone Verification Modal */}
          <PhoneVerificationModal
            isOpen={isPhoneModalOpen}
            onClose={cancelProfileCompletion}
            onVerified={completePhoneVerification}
          />

          {/* Coupon Modal */}
          <Dialog open={showCouponModal} onOpenChange={setShowCouponModal}>
            <DialogContent className="max-w-md h-[95vh] sm:h-[90vh] p-0 flex flex-col overflow-hidden">
              {/* Header - Fixed */}
              <div className="flex-shrink-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 flex items-center gap-3 shadow-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCouponModal(false)}
                  className="hover:bg-white/20 text-white rounded-lg h-10 w-10 flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <DialogTitle className="text-lg font-bold">Offers</DialogTitle>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Coupon Code Input */}
                <div className="p-4 bg-white sticky top-0 z-10 shadow-sm">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="ENTER COUPON CODE HERE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="pr-8 uppercase text-sm h-11 border-gray-300 focus:border-teal-500"
                      />
                      {couponCode && (
                        <button
                          onClick={() => setCouponCode("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1"
                        >
                       
                        </button>
                      )}
                    </div>
                    <Button
                      onClick={() => {
                        toast({
                          title: "Coupon Applied",
                          description: `Code ${couponCode} applied successfully!`,
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 h-11 rounded-lg"
                    >
                      APPLY
                    </Button>
                  </div>
                </div>

                {/* Info Message */}
                <div className="mx-4 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex gap-2">
                    <Tag className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-700 leading-relaxed">
                      This section is for Coupons only. To redeem Gift Cards & e-Vouchers, choose Payment Mode as 'Gift Cards / eVouchers' at checkout.
                    </p>
                  </div>
                </div>

                {/* Available Offers */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 text-base">Offers for you</h3>
                  <p className="text-xs text-gray-500 mb-4">Coupons made just for you</p>

                  {offersLoading ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-gray-500 text-sm">Loading offers...</p>
                    </div>
                  ) : availableOffers.length > 0 ? (
                    <div className="space-y-3 pb-4">
                      {availableOffers.map((offer: Offer) => (
                        <div
                          key={offer.id}
                          className={`border-2 rounded-xl p-4 transition-all ${selectedOffer?.id === offer.id
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-200 bg-white shadow-sm'
                            }`}
                        >
                          <div className="flex gap-3 mb-3">
                            <div className="bg-blue-100 px-3 py-2 rounded-lg text-center flex-shrink-0 min-w-[80px]">
                              <p className="text-xs font-bold text-blue-700 uppercase leading-tight">
                                SALON{offer.discount}
                              </p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 mb-1 text-sm">
                                Get ₹{Math.round((subtotal * offer.discount) / 100)} Off
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                                {offer.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                            <button className="text-xs text-teal-600 font-semibold hover:underline">
                              T & Cs
                            </button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOffer(selectedOffer?.id === offer.id ? null : offer);
                                setShowCouponModal(false);
                                toast({
                                  title: selectedOffer?.id === offer.id ? "Coupon Removed" : "Coupon Applied",
                                  description: selectedOffer?.id === offer.id
                                    ? "Coupon has been removed"
                                    : `${offer.title} applied successfully!`,
                                });
                              }}
                              className={`font-bold text-xs px-6 h-8 rounded-lg transition-colors ${selectedOffer?.id === offer.id
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                            >
                              {selectedOffer?.id === offer.id ? 'REMOVE' : 'APPLY'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Tag className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm">No offers available</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payment Method Modal */}
          <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
                <DialogTitle className="text-lg font-bold text-gray-900">Select Payment Mode</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPaymentModal(false)}
                  className="hover:bg-gray-100 rounded-lg h-8 w-8"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Payment Options */}
              <div className="p-4 space-y-3">
                {/* Cash / UPI at Salon - Active (Default - Top) */}
                <div
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${selectedPayment === 'cash-at-salon'
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-gray-200'
                    }`}
                  onClick={() => setSelectedPayment('cash-at-salon')}
                >
                  <input
                    type="radio"
                    checked={selectedPayment === 'cash-at-salon'}
                    onChange={() => setSelectedPayment('cash-at-salon')}
                    className="w-5 h-5 accent-teal-600"
                  />
                  <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Cash / UPI at Salon</h4>
                    <p className="text-xs text-gray-600">Pay via Cash or UPI at the salon</p>
                  </div>
                </div>

                {/* Amazon Pay - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Amazon Pay Balance</h4>
                    <p className="text-xs text-gray-500">Link Your Wallet</p>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Pay by any UPI - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png"
                      alt="UPI"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Pay by any UPI App</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Paytm UPI - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg"
                      alt="Paytm"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Paytm UPI</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Credit Card - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Credit Card</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Debit Card - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Debit Card</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Net Banking - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Net Banking</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Other Wallets - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Other Wallets</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>

                {/* Gift Cards - Coming Soon */}
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg opacity-60">
                  <input type="radio" disabled className="w-5 h-5" />
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                    <Tag className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700">Gift Cards / e-Voucher</h4>
                    <p className="text-xs text-red-400 mt-1">Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="sticky bottom-0 bg-white border-t p-4">
                <Button
                  onClick={() => {
                    setShowPaymentModal(false);
                    toast({
                      title: "Payment Method Selected",
                      description: "Cash / UPI at Salon",
                    });
                  }}
                  className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white rounded-lg uppercase"
                >
                  SELECT & CONTINUE
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}