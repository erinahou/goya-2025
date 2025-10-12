import Image from "next/image";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { client } from "../sanity/client";

const RECENT_EXHIBITION_QUERY = `*[
  _type == "exhibition"
  && defined(slug.current)
]|order(startDate desc)[0] {
  _id,
  titleEn,
  titleJa,
  slug,
  startDate,
  endDate,
  images[0]{
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
  }
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

export default async function Home() {
  const recentExhibition = await client.fetch<SanityDocument>(RECENT_EXHIBITION_QUERY, {}, options);

  // Process the exhibition image if it exists
  let exhibitionImage = null;
  if (recentExhibition?.images?.image) {
    const imageUrl = urlFor(recentExhibition.images.image);
    const actualWidth = recentExhibition.images.image?.asset?.metadata?.dimensions?.width;
    const actualHeight = recentExhibition.images.image?.asset?.metadata?.dimensions?.height;

    exhibitionImage = {
      src: imageUrl?.url() || '',
      alt: recentExhibition.titleEn,
      width: actualWidth || 800,
      height: actualHeight || 600
    };
  }

  return (
    <main className="homepage-container">
      {/* {recentExhibition && (
        <div className="homepage-current-exhibition">
          <p>Currently showing:</p>
          <Link href={`/exhibitions/${recentExhibition.slug.current}`} className="homepage-exhibition-link">
            <h1 className="homepage-exhibition-title">
              {recentExhibition.titleEn}
            </h1>
            <p className="homepage-exhibition-date">
              {formatExhibitionDates(recentExhibition.startDate, recentExhibition.endDate)}
            </p>
          </Link>
        </div>
      )} */}
      <Link
        href={`/exhibitions/${recentExhibition.slug.current}`}
        className="homepage-current-exhibition-container"
      >
      <div>
        {exhibitionImage && (
            <div className="homepage-exhibition-image">
              <Image
                src={exhibitionImage.src}
                alt={exhibitionImage.alt}
                width={exhibitionImage.width}
                height={exhibitionImage.height}
                className="homepage-exhibition-image-element"
              />
            </div>
        )}
        <div className="homepage-current-exhibition-text">
          <p>Currently showing (testing braching):</p>
          <p>
            {recentExhibition.titleEn}
          </p>
          <p className="homepage-exhibition-date">
            {formatExhibitionDates(recentExhibition.startDate, recentExhibition.endDate)}
          </p>
        </div>
      </div>
      </Link>
    </main>
  );
}
