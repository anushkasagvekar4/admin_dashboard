
import { Request, Response, NextFunction } from "express";
import { encryptResponse } from "../utils/encryption";

// Extend Express Response interface to include the original send method signature if needed, 
// but usually patching the function is enough.

export const encryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body: any): Response {
    // Check if we should encrypt
    // For example, maybe skip if it's already an error or specific status
    // or skip if the body is null
    
    // We modify the body to be { data: "encrypted_string" }
    // Or just send the string directly if you prefer structureless response, 
    // but { data: ... } is usually safer for JSON parsing in clients.
    
    if (body && typeof body === 'object') {
       const encrypted = encryptResponse(body);
       // Restore original json function to avoid infinite loop if we called res.json again (though we call originalJson)
       // But here we just call originalJson with the new object.
       return originalJson.call(this, { data: encrypted });
    }

    return originalJson.call(this, body);
  };

  next();
};
