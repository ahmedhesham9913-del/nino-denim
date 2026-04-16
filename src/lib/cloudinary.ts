import { v2 as cloudinary } from "cloudinary";
import { getServerEnv } from "./env";

const serverEnv = getServerEnv();

cloudinary.config({
  cloud_name: serverEnv.cloudinary.cloudName,
  api_key: serverEnv.cloudinary.apiKey,
  api_secret: serverEnv.cloudinary.apiSecret,
});

export interface UploadResult {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
}

export async function uploadImage(
  file: Buffer | string,
  folder = "nino-jeans/products"
): Promise<UploadResult> {
  const source =
    typeof file === "string"
      ? file
      : `data:image/png;base64,${file.toString("base64")}`;

  const result = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

export { cloudinary };
