import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

const EXHIBITIONS_QUERY = `*[
  _type == "exhibition"
  && defined(slug.current)
]|order(startDate desc)[0...12]{
  _id,
  titleEn,
  titleJa,
  slug,
  startDate,
  endDate,
  image,
}`;

const options = { next: { revalidate: 30 } };

export default async function ExhibitionsListPage() {
  const exhibitions = await client.fetch<SanityDocument[]>(EXHIBITIONS_QUERY, {}, options);

  return (
      <ul className="exhibitions-list-container">
        {exhibitions.map((exhibition) => (
          <li key={exhibition._id}>
            <Link
            href={`/exhibitions/${exhibition.slug.current}`}className="exhibitions-list-item">
              <h2 className="year">
                {exhibition.startDate
                  ? new Date(exhibition.startDate).getFullYear()
                  : 'TBA'
                }
              </h2>
              <h2 className="title">{exhibition.titleEn}</h2>
            </Link>
          </li>
        ))}
      </ul>
  );
}
