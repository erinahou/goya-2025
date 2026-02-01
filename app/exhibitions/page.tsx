import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";

const EXHIBITIONS_QUERY = `*[
  _type == "exhibition"
  && defined(slug.current)
]|order(startDate desc)[0...40]{
  _id,
  titleEn,
  titleJa,
  artistsEn[]{
    name,
    description
  },
  artistsJa[]{
    name,
    description
  },
  dontDisplayTitle,
  slug,
  startDate,
  endDate,
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
}`;

const options = { next: { revalidate: 30 } };

const urlFor = (source: SanityImageSource) => {
  return imageUrlBuilder(client).image(source);
};

// Helper function to format artist names with "and" between last two
function formatArtistNames(names: string[]): string {
  if (!names || names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const allButLast = names.slice(0, -1).join(', ');
  return `${allButLast} and ${names[names.length - 1]}`;
}



export default async function ExhibitionsListPage() {
  const exhibitions = await client.fetch<SanityDocument[]>(EXHIBITIONS_QUERY, {}, options);

  return (
      <ul className="exhibitions-list-container">
        {exhibitions.map((exhibition) => {
          const artistNames = formatArtistNames(exhibition.artistsEn?.map((artist: any) => artist.name) || []);

          // Process thumbnail image if it exists
          let thumbnailImage = null;
          if (exhibition.images?.[0]?.image) {
            const imageUrl = urlFor(exhibition.images[0].image);
            const actualWidth = exhibition.images[0].image?.asset?.metadata?.dimensions?.width;
            const actualHeight = exhibition.images[0].image?.asset?.metadata?.dimensions?.height;

            thumbnailImage = {
              src: imageUrl?.url() || '',
              alt: exhibition.titleEn,
              width: actualWidth || 400,
              height: actualHeight || 300
            };
          }

          console.log(`This is the thumbnail image:`);
          console.log(thumbnailImage);

          return (
            <li key={exhibition._id} className="exhibitions-list-item-wrapper">
              <Link
                href={`/exhibitions/${exhibition.slug.current}`}
                className="exhibitions-list-item">
                <h2 className="year">
                  {exhibition.startDate
                    ? new Date(exhibition.startDate).getFullYear()
                    : 'TBA'
                  }
                </h2>
                <h2 className="title">
                  <span>{artistNames}</span>
                  {!exhibition.dontDisplayTitle && (
                    <>
                      <span>:&nbsp;</span>
                      <span className="italic">{exhibition.titleEn}</span>
                    </>
                  )}
                </h2>
                {thumbnailImage && (
                <div className="exhibitions-list-thumbnail">
                  <Image
                    src={thumbnailImage.src}
                    alt={thumbnailImage.alt}
                    width={thumbnailImage.width}
                    height={thumbnailImage.height}
                    className="exhibitions-list-thumbnail-image"
                  />
                </div>
              )}
              </Link>
            </li>
          );
        })}
      </ul>
  );
}
