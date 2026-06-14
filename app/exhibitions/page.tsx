import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import {
  ExhibitionsList,
  type ExhibitionListItem,
} from "../components/ExhibitionsList";

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

function formatArtistNames(names: string[]): string {
  if (!names || names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const allButLast = names.slice(0, -1).join(", ");
  return `${allButLast} and ${names[names.length - 1]}`;
}

export default async function ExhibitionsListPage() {
  const exhibitions = await client.fetch<SanityDocument[]>(
    EXHIBITIONS_QUERY,
    {},
    options
  );

  const exhibitionItems: ExhibitionListItem[] = exhibitions.map((exhibition) => {
    const artistNames = formatArtistNames(
      exhibition.artistsEn?.map((artist: { name: string }) => artist.name) || []
    );

    const firstImage = exhibition.images?.[0]?.image;
    const actualWidth = firstImage?.asset?.metadata?.dimensions?.width;
    const actualHeight = firstImage?.asset?.metadata?.dimensions?.height;

    const thumbnail = firstImage
      ? {
          src: urlFor(firstImage).url() || "",
          alt: exhibition.titleEn,
          width: actualWidth || 400,
          height: actualHeight || 300,
        }
      : null;

    return {
      id: exhibition._id,
      slug: exhibition.slug.current,
      year: exhibition.startDate
        ? String(new Date(exhibition.startDate).getFullYear())
        : "TBA",
      artistNames,
      titleEn: exhibition.titleEn,
      dontDisplayTitle: exhibition.dontDisplayTitle,
      thumbnail,
    };
  });

  return <ExhibitionsList exhibitions={exhibitionItems} />;
}
