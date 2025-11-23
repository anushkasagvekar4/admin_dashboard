"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import { sendEmailVerificationAPI } from "@/app/api/authApi";
import { Mail, CheckCircle, AlertCircle, Clock, Store } from "lucide-react";

export default function AdminProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, role, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [shopId, setShopId] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shopLogo, setShopLogo] = useState("/images/default-shop-logo.png");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    // TODO: Fetch shop admin profile data
    // For now, set email verified as false by default
    setEmailVerified(false);
  }, [dispatch, token, role]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !phone || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    // TODO: Implement shop profile save API
    toast.success("Profile saved", {
      description: "Your changes have been updated.",
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        setShopLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendVerification = async () => {
    try {
      setIsSendingVerification(true);
      await sendEmailVerificationAPI(user);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email");
    } finally {
      setIsSendingVerification(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>Please log in to view your profile.</p>;

  return (
    <div className="space-y-6">
      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Information
          </CardTitle>
          <CardDescription>
            Your account email and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <div className="font-medium text-sm text-muted-foreground">Email Address</div>
              <div className="font-semibold">{user}</div>
            </div>
            <Badge variant={emailVerified ? "default" : "secondary"} className="flex items-center gap-1">
              {emailVerified ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Not Verified
                </>
              )}
            </Badge>
          </div>
          
          {!emailVerified && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  Verify your email to secure your account and receive important notifications.
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? "Sending..." : "Send Verification"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Shop Information
          </CardTitle>
          <CardDescription>
            Manage your shop details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shop Logo Section */}
          <div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-md">
                  <Image
                    src={logoPreview || shopLogo}
                    alt="Shop logo"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Shop Logo</h3>
                <p className="text-sm text-muted-foreground">Upload your shop logo to build brand recognition</p>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="h-9 w-fit"
                  />
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={onSave} className="grid gap-4 max-w-2xl">
            <div className="grid gap-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 rounded-xl"
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="min-h-[100px] rounded-xl border bg-background px-3 py-2 text-sm"
                placeholder="Enter your shop address"
              />
            </div>
            
            <Button className="h-11 rounded-xl w-fit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
