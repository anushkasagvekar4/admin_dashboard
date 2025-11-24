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
import {
  createShopAdmin,
  getMyShopAdmin,
  updateMyShopAdmin,
  uploadShopLogo,
  ShopAdminUpdateData,
  BackendShopAdmin,
} from "@/app/features/shop_admin/shopAdminApi";

export default function AdminProfile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, role, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [shopLogo, setShopLogo] = useState("/images/default-shop-logo.png");
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    const fetchShopProfile = async () => {
      if (!token || role !== "shopadmin") return;

      try {
        setIsLoading(true);
        const res = await dispatch(getMyShopAdmin()).unwrap();

        if (res) {
          const shop = res;
          console.log("Shop Admin:", shop);

          setShopId(shop.id);
          setShopName(shop.shopname || "");
          setOwnerName(shop.ownername || "");
          setPhone(shop.phone || "");
          setAddress(shop.address || "");
          setCity(shop.city || "");
          setShopLogo(shop.logo || "/images/default-shop-logo.png");
          setEmailVerified(shop.email_verified || false);
          setProfileExists(true);
          setIsEditMode(false);
        }
      } catch (err) {
        console.log("Error fetching shop profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopProfile();
  }, [dispatch, token, role]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !ownerName || !phone || !address || !city) {
      toast.error("Please fill in all required fields");
      return;
    }

    // ✅ Email comes from auth, never from form
    const payload: ShopAdminUpdateData = {
      shopname: shopName,
      ownername: ownerName,
      phone,
      address,
      city,
      logo: logoPreview || shopLogo,
    };

    console.log("👉 Sending shop payload:", payload);
    console.log("👉 User email:", user);
    console.log("👉 Shop ID:", shopId);

    try {
      setIsLoading(true);
      if (shopId) {
        console.log("🔄 Updating existing shop...");
        const result = await dispatch(updateMyShopAdmin(payload)).unwrap();
        console.log("✅ Shop updated successfully:", result);
        toast.success("Shop profile updated successfully");
        setIsEditMode(false);
      } else {
        console.log("➕ Creating new shop...");
        // For creation, we need to include email from auth
        const createPayload = {
          ...payload,
          email: user,
        };
        console.log("👉 Create payload:", createPayload);
        const result = await dispatch(createShopAdmin(createPayload)).unwrap();
        console.log("✅ Shop created successfully:", result);
        toast.success("Shop profile created successfully");
        setProfileExists(true);
        setIsEditMode(false);
        // Refresh the shop data after creation
        const shopData = await dispatch(getMyShopAdmin()).unwrap();
        if (shopData) {
          setShopId(shopData.id);
        }
      }
    } catch (err: any) {
      console.error("❌ Error saving shop profile:", err);
      console.error("❌ Error details:", {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText
      });
      
      // More detailed error message
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to save shop profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset form to current values
    if (profileExists) {
      // Values are already set from the API call
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        setIsUploadingLogo(true);
        const logoUrl = await dispatch(uploadShopLogo(file)).unwrap();
        setShopLogo(logoUrl);
        toast.success('Logo uploaded successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload logo');
        // Reset preview on error
        setLogoPreview('');
      } finally {
        setIsUploadingLogo(false);
      }
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
                {isUploadingLogo && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <div className="text-white text-xs">Uploading...</div>
                  </div>
                )}
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
                    disabled={isUploadingLogo || (!isEditMode && profileExists)}
                  />
                </div>
              </div>
            </div>
          </div>

          {!profileExists || isEditMode ? (
            <form onSubmit={onSave} className="grid gap-4 max-w-2xl">
              <div className="grid gap-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Enter your shop name"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Enter your full name"
                  required
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
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="Enter your city"
                  required
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
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="h-11 rounded-xl w-fit" 
                  disabled={isLoading || isUploadingLogo}
                >
                  {isLoading ? "Saving..." : (shopId ? "Update Profile" : "Create Profile")}
                </Button>
                {profileExists && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={handleCancel}
                    disabled={isLoading || isUploadingLogo}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Mode */}
              <div className="grid gap-4 max-w-2xl">
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Shop Name</div>
                  <div className="font-semibold text-lg">{shopName || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Owner Name</div>
                  <div className="font-semibold text-lg">{ownerName || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Phone Number</div>
                  <div className="font-semibold text-lg">{phone || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">City</div>
                  <div className="font-semibold text-lg">{city || "Not provided"}</div>
                </div>
                
                <div className="p-4 rounded-lg border bg-gray-50">
                  <div className="font-medium text-sm text-gray-600 mb-1">Shop Address</div>
                  <div className="font-semibold text-lg whitespace-pre-wrap">{address || "Not provided"}</div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleEdit}
                  className="h-12 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update Profile
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
