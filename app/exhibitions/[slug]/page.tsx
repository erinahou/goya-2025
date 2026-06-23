import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { LanguageContent } from "../../components/LanguageContent";
import { MixedLanguagePortableText } from "../../components/MixedLanguagePortableText";
import { ExhibitionImages } from "../../components/ExhibitionImages";

const EXHIBITION_QUERY = `*[_type == "exhibition" && slug.current == $slug][0] {
  _id,
  titleEn,
  titleJa,
  startDate,
  endDate,
  dontDisplayTitle,
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

  // Helper function to format artist names with "and" between last two (English)
  function formatArtistNamesEn(names: string[]): string {
    if (!names || names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    const allButLast = names.slice(0, -1).join(', ');
    return `${allButLast} and ${names[names.length - 1]}`;
  }

  // Helper function to format artist names with "と" between last two (Japanese)
  function formatArtistNamesJa(names: string[]): string {
    if (!names || names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]}と${names[1]}`;
    const allButLast = names.slice(0, -1).join('、');
    return `${allButLast}と${names[names.length - 1]}`;
  }

  // Format all artist names
  const artistEnNamesArray = exhibition.artistsEn?.map((artist: any) => artist.name) || [];
  const artistJaNamesArray = exhibition.artistsJa?.map((artist: any) => artist.name) || [];
  const artistsEnNames = formatArtistNamesEn(artistEnNamesArray);
  const artistsJaNames = formatArtistNamesJa(artistJaNamesArray);

  return (
    <main className="exhibition-detail-container">
        <div className="exhibition-detail-title-container">
          <h1>
            <LanguageContent
              en={artistsEnNames}
              jp={artistsJaNames}
              mixedLanguage={true}
            />
            {!exhibition.dontDisplayTitle && (
              <>:&nbsp;</>
            )}
          </h1>
          {!exhibition.dontDisplayTitle && (
            <h1>
              <LanguageContent
                en={exhibition.titleEn}
                jp={exhibition.titleJa}
                mixedLanguage={true}
                className="italic"
              />
            </h1>
          )}
          <h3 className="exhibition-detail-date">
            {formatExhibitionDates(exhibition.startDate, exhibition.endDate)}
          </h3>
        </div>
        <div className="exhibition-detail-description">
          <div className="exhibition-about">
            <MixedLanguagePortableText
              valueEn={exhibition.descriptionEn}
              valueJp={exhibition.descriptionJa}
            />
          </div>
      </div>
      {exhibitionImages.length > 0 && <ExhibitionImages images={exhibitionImages} />}
      <div className="exhibition-about-artists-container">
        <LanguageContent
          en={
            exhibition.artistsEn && exhibition.artistsEn.length > 0 && exhibition.artistsEn.some((artist: any) => artist.description) && (
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
            )
          }
          jp={
            exhibition.artistsJa && exhibition.artistsJa.length > 0 && exhibition.artistsJa.some((artist: any) => artist.description) && (
              <div className="exhibition-artists">
                <h4>アーティストについて</h4>
                {exhibition.artistsJa.map((artist: any, index: number) => (
                  <div key={index} className="artist-info">
                      {artist.description && (
                        <p key={index} className="artist-description">
                          <LanguageContent
                            en={artist.description}
                            jp={artist.description}
                            mixedLanguage
                          />
                        </p>
                      )}
                  </div>
                ))}
              </div>
            )
          }
        />
      </div>
    </main>
  );
}
