import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
// import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

const EXHIBITION_QUERY = `*[_type == "exhibition" && slug.current == $slug][0] {
  _id,
  titleEn,
  titleJa,
  startDate,
  endDate,
  artistsEn[]{
    name,
    description
  },
  artistsJa[]{
    name,
    description
  },
  images[]{
    captionEn,
    image{
      asset->{
        _id,
        metadata{
          dimensions{
            width,
            height
          }
        }
      }
    }
  },
  descriptionEn,
  descriptionJa
}`;

const { projectId, dataset } = client.config();

const urlFor = (source: SanityImageSource) => {
  return imageUrlBuilder(client).image(source);
};

const options = { next: { revalidate: 30 } };

// Function to format dates in the desired format: "25 Sep - 28 Oct, 2025"
function formatExhibitionDates(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  const year = end.getFullYear();

  // If both dates are in the same month and year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startDay} - ${endDay} ${startMonth}, ${year}`;
  }

  // If dates are in different months but same year
  if (start.getFullYear() === end.getFullYear()) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}, ${year}`;
  }

  // If dates are in different years
  return `${startDay} ${startMonth}, ${start.getFullYear()} - ${endDay} ${endMonth}, ${year}`;
}

export default async function ExhibitionDetailPage({
  params,
  }: {
    params: Promise<{ slug: string }>;
  }) {

  const exhibition = await client.fetch<SanityDocument>(EXHIBITION_QUERY, await params, options);

  const exhibitionImages = exhibition.images?.map((img: any) => {
    const imageUrl = urlFor(img.image);

    // Get dimensions from the explicitly fetched metadata
    const actualWidth = img.image?.asset?.metadata?.dimensions?.width;
    const actualHeight = img.image?.asset?.metadata?.dimensions?.height;

    // If we don't have actual dimensions, we can't determine orientation
    // So we'll use a different approach - check if the image URL contains orientation hints
    // or use a more conservative fallback
    let isVertical = false;

    if (actualWidth && actualHeight) {
      const aspectRatio = actualWidth / actualHeight;
      isVertical = aspectRatio < 1;
    } else {
      // If no metadata, we could try to detect from the image URL or use a default
      // For now, let's assume horizontal as default and let you manually adjust
      isVertical = false;
    }

    const originalWidth = actualWidth;
    const originalHeight = actualHeight;

    // // Debug logging
    // console.log('Image data:', img.image);
    // console.log('Image dimensions:', {
    //   actualWidth,
    //   actualHeight,
    //   originalWidth,
    //   originalHeight,
    //   isVertical
    // });

    // Use original resolution - let Next.js Image handle responsive sizing
    return {
      src: imageUrl?.url() || '', // No width/height constraints - use original
      alt: exhibition.titleEn,
      captionEn: img.captionEn || '',
      isVertical,
      width: originalWidth,
      height: originalHeight
    };
  }) || [];

  console.log(exhibitionImages);

  return (
    <main className="exhibition-detail-container">
      <div className="exhibition-detail-title-container">
        <h1>{exhibition.titleEn}</h1>
        <h2 className="exhibition-detail-date">
          {formatExhibitionDates(exhibition.startDate, exhibition.endDate)}
        </h2>
      </div>
        <div className="exhibition-detail-description">
          <div className="exhibition-about">
            <PortableText value={exhibition.descriptionEn} />
          </div>
        {exhibition.artistsEn && exhibition.artistsEn.length > 0 && exhibition.artistsEn.some((artist: any) => artist.description) && (
          <div className="exhibition-artists">
            <h4>About the artist</h4>
            {exhibition.artistsEn.map((artist: any, index: number) => (
              <div key={index} className="artist-info">
                  {artist.description && (
                    <p key={index} className="artist-description">
                      {artist.description}
                    </p>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
      {exhibitionImages.length > 0 && (
        <div className="exhibition-images">
          {exhibitionImages.map((img: any, index: number) => (
            <div key={index}
            className={`exhibition-image-container ${img.isVertical ? 'has-vertical-image' : ''}`}>
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className={`exhibition-image ${img.isVertical ? 'exhibition-image-vertical' : 'exhibition-image-horizontal'}`}
              />
              {img.captionEn && (
                <p className="exhibition-image-caption">{img.captionEn}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
