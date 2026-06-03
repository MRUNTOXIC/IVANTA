import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  const isAdmin = checkAdminAuth(request);
  
  if (!isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  try {
    const { images, caption } = await request.json();

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      );
    }

    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID;

    if (!accessToken || !instagramAccountId) {
      return NextResponse.json(
        { success: false, error: 'Instagram credentials not configured. Please add INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_ACCOUNT_ID to environment variables.' },
        { status: 500 }
      );
    }

    // Convert relative URLs to absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ivantaproperty.com';
    const absoluteImages = images.map((img: string) => 
      img.startsWith('http') ? img : `${baseUrl}${img}`
    );

    let mediaContainerId: string;

    if (absoluteImages.length === 1) {
      // Single image post
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: absoluteImages[0],
            caption: caption,
            access_token: accessToken,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Instagram API Error:', data);
        return NextResponse.json(
          { success: false, error: data.error?.message || 'Failed to create media container' },
          { status: 400 }
        );
      }

      mediaContainerId = data.id;
    } else {
      // Carousel post (multiple images)
      const mediaIds: string[] = [];

      // Create media containers for each image
      for (const imageUrl of absoluteImages.slice(0, 10)) { // Instagram allows max 10 items
        const response = await fetch(
          `https://graph.facebook.com/v21.0/${instagramAccountId}/media`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_url: imageUrl,
              is_carousel_item: true,
              access_token: accessToken,
            }),
          }
        );

        const data = await response.json();
        
        if (!response.ok || data.error) {
          console.error('Instagram API Error:', data);
          return NextResponse.json(
            { success: false, error: data.error?.message || 'Failed to create carousel item' },
            { status: 400 }
          );
        }

        mediaIds.push(data.id);
      }

      // Create carousel container
      const carouselResponse = await fetch(
        `https://graph.facebook.com/v21.0/${instagramAccountId}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            media_type: 'CAROUSEL',
            children: mediaIds,
            caption: caption,
            access_token: accessToken,
          }),
        }
      );

      const carouselData = await carouselResponse.json();
      
      if (!carouselResponse.ok || carouselData.error) {
        console.error('Instagram API Error:', carouselData);
        return NextResponse.json(
          { success: false, error: carouselData.error?.message || 'Failed to create carousel container' },
          { status: 400 }
        );
      }

      mediaContainerId = carouselData.id;
    }

    // Publish the media
    const publishResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: mediaContainerId,
          access_token: accessToken,
        }),
      }
    );

    const publishData = await publishResponse.json();
    
    if (!publishResponse.ok || publishData.error) {
      console.error('Instagram Publish Error:', publishData);
      return NextResponse.json(
        { success: false, error: publishData.error?.message || 'Failed to publish post' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        postId: publishData.id,
        message: 'Successfully posted to Instagram!',
      },
    });
  } catch (error: any) {
    console.error('Error posting to Instagram:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
