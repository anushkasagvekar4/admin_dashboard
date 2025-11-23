import { RequestHandler, Response } from "express";
import { WebsiteSettings } from "../models/websiteSettings";
import { AuthRequest } from "../middleware/Auth";
import { v4 as uuidv4 } from "uuid";

// Get website settings (public access)
export const getWebsiteSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await WebsiteSettings.query().first();
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        site_name: "CakeHaven",
        site_description: "Discover the best local bakeries and delicious cakes",
        contact_email: "support@cakehaven.com",
        contact_phone: "",
        contact_address: "",
        social_facebook: "",
        social_instagram: "",
        social_twitter: "",
        social_linkedin: "",
        logo_url: "",
        favicon_url: "",
        hero_title: "Discover, compare, and order cakes you love",
        hero_description: "CakeHaven brings the best local bakeries to your fingertips",
        hero_bg_image: "",
        about_us: "",
        privacy_policy: "",
        terms_of_service: "",
        maintenance_mode: false,
        maintenance_message: "We're currently under maintenance. Please check back soon.",
      };
      
      return res.status(200).json({ 
        success: true, 
        data: defaultSettings 
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err: any) {
    console.error("Get website settings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get website settings (admin only)
export const getWebsiteSettingsAdmin: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can access website settings",
      });
    }

    let settings = await WebsiteSettings.query().first();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = {
        site_name: "CakeHaven",
        site_description: "Discover the best local bakeries and delicious cakes",
        contact_email: "support@cakehaven.com",
        contact_phone: "",
        contact_address: "",
        social_facebook: "",
        social_instagram: "",
        social_twitter: "",
        social_linkedin: "",
        logo_url: "",
        favicon_url: "",
        hero_title: "Discover, compare, and order cakes you love",
        hero_description: "CakeHaven brings the best local bakeries to your fingertips",
        hero_bg_image: "",
        about_us: "",
        privacy_policy: "",
        terms_of_service: "",
        maintenance_mode: false,
        maintenance_message: "We're currently under maintenance. Please check back soon.",
      };

      settings = await WebsiteSettings.query().insert({
        id: uuidv4(),
        ...defaultSettings,
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (err: any) {
    console.error("Get website settings admin error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create or update website settings (super_admin only)
export const upsertWebsiteSettings: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can update website settings",
      });
    }

    const existingSettings = await WebsiteSettings.query().first();
    
    let updatedSettings;
    if (existingSettings) {
      // Update existing settings
      updatedSettings = await WebsiteSettings.query().patchAndFetchById(
        existingSettings.id,
        {
          ...req.body,
        }
      );
    } else {
      // Create new settings
      updatedSettings = await WebsiteSettings.query().insert({
        id: uuidv4(),
        ...req.body,
      });
    }

    res.status(200).json({
      success: true,
      message: "Website settings updated successfully",
      data: updatedSettings,
    });
  } catch (err: any) {
    console.error("Upsert website settings error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle maintenance mode (super_admin only)
export const toggleMaintenanceMode: RequestHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Only super_admins can toggle maintenance mode",
      });
    }

    const { maintenance_mode, maintenance_message } = req.body;
    
    let existingSettings = await WebsiteSettings.query().first();
    
    if (!existingSettings) {
      // Create default settings if none exist
      const defaultSettings = {
        site_name: "CakeHaven",
        site_description: "Discover the best local bakeries and delicious cakes",
        contact_email: "support@cakehaven.com",
        contact_phone: "",
        contact_address: "",
        social_facebook: "",
        social_instagram: "",
        social_twitter: "",
        social_linkedin: "",
        logo_url: "",
        favicon_url: "",
        hero_title: "Discover, compare, and order cakes you love",
        hero_description: "CakeHaven brings the best local bakeries to your fingertips",
        hero_bg_image: "",
        about_us: "",
        privacy_policy: "",
        terms_of_service: "",
        maintenance_mode: maintenance_mode || false,
        maintenance_message: maintenance_message || "We're currently under maintenance. Please check back soon.",
      };

      existingSettings = await WebsiteSettings.query().insert({
        id: uuidv4(),
        ...defaultSettings,
      });
    } else {
      // Update existing settings
      existingSettings = await WebsiteSettings.query().patchAndFetchById(
        existingSettings.id,
        {
          maintenance_mode,
          maintenance_message: maintenance_message || "We're currently under maintenance. Please check back soon.",
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Maintenance mode ${maintenance_mode ? 'enabled' : 'disabled'} successfully`,
      data: existingSettings,
    });
  } catch (err: any) {
    console.error("Toggle maintenance mode error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
