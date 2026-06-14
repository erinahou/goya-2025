import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import { FadeInOnScroll } from "../components/FadeInOnScroll";

const ARCHIVES_QUERY = `*[_type == "archive35mm"][0] {
  images[]{
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
}`;

const { projectId, dataset } = client.config();

const urlFor = (source: SanityImageSource) => {
  return imageUrlBuilder(client).image(source);
};

const options = { next: { revalidate: 30 } };

export default async function ArchivesPage() {
  const archives = await client.fetch<SanityDocument>(ARCHIVES_QUERY, {}, options);

  const archiveImages = archives?.images?.map((img: any) => {
    const imageUrl = urlFor(img);

    // Get dimensions from the explicitly fetched metadata
    const actualWidth = img?.asset?.metadata?.dimensions?.width;
    const actualHeight = img?.asset?.metadata?.dimensions?.height;

    // Determine if image is vertical
    let isVertical = false;
    if (actualWidth && actualHeight) {
      const aspectRatio = actualWidth / actualHeight;
      isVertical = aspectRatio < 1;
    }

    const originalWidth = actualWidth;
    const originalHeight = actualHeight;

    return {
      src: imageUrl?.url() || '',
      alt: '35mm Archive Image',
      captionEn: '', // No captions in your schema
      isVertical,
      width: originalWidth,
      height: originalHeight
    };
  }) || [];

  return (
    <main className="exhibition-detail-container">
      <div className="exhibition-detail-title-container">
        <h1>35mm Archives</h1>
      </div>
      {archiveImages.length > 0 && (
        <div className="exhibition-images">
          {archiveImages.map((img: any, index: number) => (
            <FadeInOnScroll
              key={index}
              className={`exhibition-image-container ${img.isVertical ? 'has-vertical-image' : ''}`}
            >
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
            </FadeInOnScroll>
          ))}
        </div>
      )}
    </main>
  );
}
