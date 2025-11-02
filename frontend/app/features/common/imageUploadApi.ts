// Single image upload
export const uploadImageToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Cloudinary upload failed");
    const data = await response.json();
    return data.secure_url; // ✅ return image URL
  } catch (err: any) {
    throw new Error(err.message || "Image upload failed");
  }
};

// Multiple images upload (uses the single upload)
export const uploadMultipleImagesToCloudinary = async (files: File[]) => {
  const urls: string[] = [];

  for (const file of files) {
    const url = await uploadImageToCloudinary(file);
    urls.push(url);
  }

  return urls; // ✅ array of URLs
};
