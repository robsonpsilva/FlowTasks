import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { userService } from '@/app/services/userService';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example: .../flowtasks_profiles/image_123.jpg -> flowtasks_profiles/image_123
 */
function getPublicIdFromUrl(url: string): string | null {
  try {
    // Exemplo: https://res.cloudinary.com/cloudname/image/upload/v1/flowtasks_profiles/abc123.jpg
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    // Pegamos tudo que vem depois de 'upload/vXXXX/'
    // Isso garante que pegamos a 'pasta/nome_do_arquivo'
    const idParts = parts.slice(uploadIndex + 2); 
    const fullId = idParts.join('/'); // 'flowtasks_profiles/abc123.jpg'
    
    // Removemos a extensão (.jpg, .png, etc)
    return fullId.split('.')[0]; // 'flowtasks_profiles/abc123'
  } catch (error) {
    console.error("Error extracting Public ID:", error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File;
    const userId = data.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. RETRIEVE CURRENT USER TO CHECK FOR OLD IMAGE
    const currentUser = await userService.findProfile(userId);

    // 2. IF OLD IMAGE EXISTS, DELETE IT FROM CLOUDINARY
    if (currentUser?.image && currentUser.image.includes("cloudinary")) {
      const oldPublicId = getPublicIdFromUrl(currentUser.image);
      if (oldPublicId) {
        // 'destroy' removes the physical file from the bucket
        await cloudinary.uploader.destroy(oldPublicId);
        console.log(`🗑️ Old image removed: ${oldPublicId}`);
      }
    }

    // 3. UPLOAD THE NEW IMAGE
    const buffer = await file.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    const response = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Image}`, {
      folder: 'flowtasks_profiles',
    });

    const imageUrl = response.secure_url;

    // 4. UPDATE THE DATABASE WITH THE NEW URL
    const updatedUser = await userService.update(userId, { image: imageUrl });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Error in image swap process:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}