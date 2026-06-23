'use client';

import Image from "next/image";
import Patrick from "@/public/patrick.jpg";
import { useLanguage } from "../contexts/LanguageContext";
import { LanguageContent } from "./LanguageContent";
import { LanguageText } from "./LanguageText";

export function InfoContent() {
  const { language } = useLanguage();

  return (
    <>
      <Image
        src={Patrick}
        alt="Goya Curtain"
        width={4470}
        height={2980}
        className="info-overlay-image"
      />
      <div className="info-overlay-text">
        <div>
          <LanguageText as="h4" en="About Goya" jp="About" mixedLanguage />
          <p>
            <LanguageContent
              mixedLanguage
              en="Goya Curtain is a non-profit art and project space situated in Tokyo's Shimo-Takaido neighborhood. The project was established in 2016 by Joel Kirkham and Bjorn Houtman and periodically hosts exhibitions and projects by local and international artists."
              jp="Goya Curtainは東京、下高井戸を拠点とする非営利アートスペースです。2016年にジョエル・カークハムとビョーン・ハウトマンのふたりによる設立以来、国内外のさまざまなアーティストの展示会、プロジェクトを定期的に主催しております。"
            />
          </p>
        </div>
        <div>
          <LanguageText as="h4" en="Hours" jp="Hours" mixedLanguage />
          <p>
            {language === "jp" ? (
              <>
                <LanguageContent
                  mixedLanguage
                  en=""
                  jp="当ギャラリーは展示会期間中、土曜日12時から18時まで開廊しております。アポイントメントにより、その他の日時での来廊も可能です。お問い合わせ、来廊の予約は以下のアドレスまでご連絡ください："
                />
                <a href="mailto:goyacurtain@gmail.com" className="font-english">
                  goyacurtain@gmail.com
                </a>
              </>
            ) : (
              <>
                During scheduled exhibitions Goya Curtain will be open on Saturdays,
                12pm until 6pm, and by appointment for other days and times. For
                enquiries or to make an appointment please contact us at{" "}
                <a href="mailto:goyacurtain@gmail.com">goyacurtain@gmail.com</a>.
              </>
            )}
          </p>
        </div>
        <div>
          <LanguageText as="h4" en="Access" jp="Access" mixedLanguage />
          <p>
            <LanguageContent
              mixedLanguage
              en="Uwabo Bld.3F, 3-30-14 Matsubara, Setagaya Ku, Tokyo, 156-0043, Japan. A two-minute walk from the North Exit of Shimo-Takaido station on the Keio line."
              jp="アクセス 東京都世田谷区松原3-30-14上保ビル3F 京王線下高井戸駅北口より徒歩2分"
            />
          </p>
        </div>
        <div className="info-overlay-contact">
          <LanguageText as="h4" en="Contact" jp="Contact" mixedLanguage />
          <a href="mailto:goyacurtain@gmail.com" className="font-english">
            goyacurtain@gmail.com
          </a>
          <a
            href="https://www.instagram.com/goyacurtain/"
            className="font-english"
          >
            Instagram
          </a>
        </div>
      </div>
    </>
  );
}
