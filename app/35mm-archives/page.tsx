import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";
import { client } from "@/sanity/client";
import { FadeInOnScroll } from "../components/FadeInOnScroll";
import { LanguageContent } from "../components/LanguageContent";

const ARCHIVES_QUERY = `*[_type == "archive35mm"][0] {
  images[]{
    descriptionEn,
    descriptionJa,
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
  }
}`;

const urlFor = (source: SanityImageSource) => {
  return imageUrlBuilder(client).image(source);
};

const options = { next: { revalidate: 30 } };

export default async function ArchivesPage() {
  const archives = await client.fetch<SanityDocument>(ARCHIVES_QUERY, {}, options);

  const archiveImages =
    archives?.images
      ?.map((img: any) => {
        const image = img?.image;
        const asset = image?.asset;

        // New schema nests the asset under image; skip broken/missing entries
        if (!asset?._id) {
          return null;
        }

        const imageUrl = urlFor(image);

        const actualWidth = asset?.metadata?.dimensions?.width;
        const actualHeight = asset?.metadata?.dimensions?.height;

        let isVertical = false;
        if (actualWidth && actualHeight) {
          isVertical = actualWidth / actualHeight < 1;
        }

        return {
          src: imageUrl?.url() || "",
          alt: "35mm Archive Image",
          descriptionEn: img.descriptionEn || "",
          descriptionJa: img.descriptionJa || "",
          isVertical,
          width: actualWidth || 800,
          height: actualHeight || 600,
        };
      })
      .filter(Boolean) || [];

  return (
    <main className="exhibition-detail-container">
      <div className="exhibition-detail-title-container">
        <h1>35mm Archives</h1>
      </div>
      {archiveImages.length > 0 && (
        <div className="exhibition-images">
          {archiveImages.map((img: any, index: number) => {
            const descriptionEn = img.descriptionEn || "";
            const descriptionJa = img.descriptionJa || descriptionEn;
            const hasDescription = Boolean(descriptionEn || descriptionJa);

            const image = (
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className={`exhibition-image ${img.isVertical ? "exhibition-image-vertical" : "exhibition-image-horizontal"}`}
              />
            );

            const caption = hasDescription ? (
              <p className="exhibition-image-caption">
                <LanguageContent
                  en={descriptionEn}
                  jp={descriptionJa}
                  mixedLanguage
                />
              </p>
            ) : null;

            return (
              <FadeInOnScroll
                key={index}
                className={`exhibition-image-container ${img.isVertical ? "has-vertical-image" : ""}`}
              >
                {img.isVertical ? (
                  <div className="exhibition-image-vertical-stack">
                    {image}
                    {caption}
                  </div>
                ) : (
                  <>
                    {image}
                    {caption}
                  </>
                )}
              </FadeInOnScroll>
            );
          })}
        </div>
      )}
    </main>
  );
}
