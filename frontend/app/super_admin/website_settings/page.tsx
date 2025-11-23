"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWebsiteSettingsAdmin, updateWebsiteSettings } from "@/app/features/super_admin/website_settings/websiteSettingsApi";
import { AppDispatch, RootState } from "@/app/store/Store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Image,
  FileText,
  Settings,
  Save,
  AlertTriangle
} from "lucide-react";

export default function WebsiteSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { settings, loading, error } = useSelector(
    (state: RootState) => state.websiteSettings
  );

  const [formData, setFormData] = useState({
    site_name: "",
    site_description: "",
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    social_facebook: "",
    social_instagram: "",
    social_twitter: "",
    social_linkedin: "",
    logo_url: "",
    favicon_url: "",
    hero_title: "",
    hero_description: "",
    hero_bg_image: "",
    about_us: "",
    privacy_policy: "",
    terms_of_service: "",
    maintenance_mode: false,
    maintenance_message: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    dispatch(fetchWebsiteSettingsAdmin());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || "",
        site_description: settings.site_description || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        contact_address: settings.contact_address || "",
        social_facebook: settings.social_facebook || "",
        social_instagram: settings.social_instagram || "",
        social_twitter: settings.social_twitter || "",
        social_linkedin: settings.social_linkedin || "",
        logo_url: settings.logo_url || "",
        favicon_url: settings.favicon_url || "",
        hero_title: settings.hero_title || "",
        hero_description: settings.hero_description || "",
        hero_bg_image: settings.hero_bg_image || "",
        about_us: settings.about_us || "",
        privacy_policy: settings.privacy_policy || "",
        terms_of_service: settings.terms_of_service || "",
        maintenance_mode: settings.maintenance_mode || false,
        maintenance_message: settings.maintenance_message || "",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateWebsiteSettings(formData)).unwrap();
      toast.success("Website settings updated successfully!");
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error || "Failed to update website settings");
    }
  };

  if (loading && !settings) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <Settings className="w-16 h-16 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-4 text-muted-foreground">Loading website settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center">
          <p className="text-red-500">Error: {error}</p>
          <Button onClick={() => dispatch(fetchWebsiteSettingsAdmin())} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
          <p className="text-muted-foreground">
            Manage your website configuration and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              Unsaved changes
            </Badge>
          )}
          <Button onClick={handleSave} disabled={loading || !hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {formData.maintenance_mode && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-semibold">Maintenance Mode is Active</p>
                <p className="text-sm text-orange-600">
                  {formData.maintenance_message || "Website is under maintenance"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Basic Settings
            </CardTitle>
            <CardDescription>
              Configure your website's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => handleChange("site_name", e.target.value)}
                placeholder="CakeHaven"
              />
            </div>
            <div>
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={formData.site_description}
                onChange={(e) => handleChange("site_description", e.target.value)}
                placeholder="Discover the best local bakeries and delicious cakes"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="hero_title">Hero Title</Label>
              <Input
                id="hero_title"
                value={formData.hero_title}
                onChange={(e) => handleChange("hero_title", e.target.value)}
                placeholder="Discover, compare, and order cakes you love"
              />
            </div>
            <div>
              <Label htmlFor="hero_description">Hero Description</Label>
              <Textarea
                id="hero_description"
                value={formData.hero_description}
                onChange={(e) => handleChange("hero_description", e.target.value)}
                placeholder="CakeHaven brings the best local bakeries to your fingertips"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </CardTitle>
            <CardDescription>
              How customers can reach you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="support@cakehaven.com"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="contact_address">Contact Address</Label>
              <Textarea
                id="contact_address"
                value={formData.contact_address}
                onChange={(e) => handleChange("contact_address", e.target.value)}
                placeholder="123 Main Street, City, State 12345"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Facebook className="w-5 h-5" />
              Social Media
            </CardTitle>
            <CardDescription>
              Your social media links
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="social_facebook">Facebook</Label>
              <Input
                id="social_facebook"
                value={formData.social_facebook}
                onChange={(e) => handleChange("social_facebook", e.target.value)}
                placeholder="https://facebook.com/cakehaven"
              />
            </div>
            <div>
              <Label htmlFor="social_instagram">Instagram</Label>
              <Input
                id="social_instagram"
                value={formData.social_instagram}
                onChange={(e) => handleChange("social_instagram", e.target.value)}
                placeholder="https://instagram.com/cakehaven"
              />
            </div>
            <div>
              <Label htmlFor="social_twitter">Twitter</Label>
              <Input
                id="social_twitter"
                value={formData.social_twitter}
                onChange={(e) => handleChange("social_twitter", e.target.value)}
                placeholder="https://twitter.com/cakehaven"
              />
            </div>
            <div>
              <Label htmlFor="social_linkedin">LinkedIn</Label>
              <Input
                id="social_linkedin"
                value={formData.social_linkedin}
                onChange={(e) => handleChange("social_linkedin", e.target.value)}
                placeholder="https://linkedin.com/company/cakehaven"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Media Settings
          </CardTitle>
          <CardDescription>
            Website images and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => handleChange("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <Label htmlFor="favicon_url">Favicon URL</Label>
              <Input
                id="favicon_url"
                value={formData.favicon_url}
                onChange={(e) => handleChange("favicon_url", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="hero_bg_image">Hero Background Image</Label>
            <Input
              id="hero_bg_image"
              value={formData.hero_bg_image}
              onChange={(e) => handleChange("hero_bg_image", e.target.value)}
              placeholder="https://example.com/hero-bg.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.about_us}
              onChange={(e) => handleChange("about_us", e.target.value)}
              placeholder="Tell your customers about your business..."
              rows={8}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Legal Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="privacy_policy">Privacy Policy</Label>
              <Textarea
                id="privacy_policy"
                value={formData.privacy_policy}
                onChange={(e) => handleChange("privacy_policy", e.target.value)}
                placeholder="Your privacy policy content..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="terms_of_service">Terms of Service</Label>
              <Textarea
                id="terms_of_service"
                value={formData.terms_of_service}
                onChange={(e) => handleChange("terms_of_service", e.target.value)}
                placeholder="Your terms of service content..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Maintenance Mode
          </CardTitle>
          <CardDescription>
            Control website availability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enable to show a maintenance page to all visitors
              </p>
            </div>
            <Switch
              checked={formData.maintenance_mode}
              onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
            />
          </div>
          <div>
            <Label htmlFor="maintenance_message">Maintenance Message</Label>
            <Textarea
              id="maintenance_message"
              value={formData.maintenance_message}
              onChange={(e) => handleChange("maintenance_message", e.target.value)}
              placeholder="We're currently under maintenance. Please check back soon."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
