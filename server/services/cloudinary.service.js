import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", public_id: filename },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    stream.end(buffer);
  });
};

const uploadSingleImage = async (buffer, fileName) => {
  try {
    const imageUrl = await uploadOnCloudinary(buffer, fileName);
    return imageUrl;
  } catch (error) {
    throw new Error("Image upload failed");
  }
};

export { uploadOnCloudinary, uploadSingleImage };