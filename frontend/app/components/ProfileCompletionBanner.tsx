"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, User, Store, AlertCircle } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/Store";

interface ProfileCompletionBannerProps {
  role: "customer" | "shopadmin" | "superadmin";
  onDismiss?: () => void;
}

export default function ProfileCompletionBanner({ role, onDismiss }: ProfileCompletionBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleDismiss = () => {
    setIsVisible(false);
    // Store dismissal in localStorage so it doesn't show again until page reload
    localStorage.setItem(`profile-banner-dismissed-${role}-${user}`, 'true');
    onDismiss?.();
  };

  const handleCompleteProfile = () => {
    const profilePath = role === "customer" ? "/customer/profile" : "/admin/profile";
    router.push(profilePath);
  };

  // Check if banner was previously dismissed
  if (typeof window !== 'undefined') {
    const wasDismissed = localStorage.getItem(`profile-banner-dismissed-${role}-${user}`);
    if (wasDismissed || !isVisible) {
      return null;
    }
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-amber-800">
                Complete Your Profile
              </h3>
              {role === "shopadmin" && <Store className="w-4 h-4 text-amber-600" />}
              {role === "customer" && <User className="w-4 h-4 text-amber-600" />}
            </div>
            
            <p className="text-sm text-amber-700 mb-3">
              {role === "shopadmin" 
                ? "Complete your shop profile to start selling cakes and manage your business effectively."
                : "Complete your profile to enjoy personalized shopping experience and seamless order delivery."
              }
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleCompleteProfile}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Complete Profile
              </Button>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-shrink-0 h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
