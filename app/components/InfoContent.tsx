import Image from "next/image";
import Patrick from "@/public/patrick.jpg";

export function InfoContent() {
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
          <h4>About Goya</h4>
          <p>
            Goya Curtain is a non-profit art and project space situated in Tokyo&apos;s
            Shimo-Takaido neighborhood. The project was established in 2016 by Joel
            Kirkham and Bjorn Houtman and periodically hosts exhibitions and projects by
            local and international artists.
          </p>
        </div>
        <div>
          <h4>Hours</h4>
          <p>
            During scheduled exhibitions Goya Curtain will be open on Saturdays, 12pm
            until 6pm, and by appointment for other days and times. For enquiries or to
            make an appointment please contact us at{" "}
            <a href="mailto:goyacurtain@gmail.com">goyacurtain@gmail.com</a>.
          </p>
        </div>
        <div>
          <h4>Access</h4>
          <p>
            Uwabo Bld.3F, 3-30-14 Matsubara, Setagaya Ku, Tokyo, 156-0043, Japan. A
            two-minute walk from the North Exit of Shimo-Takaido station on the Keio line.
          </p>
        </div>
        <div className="info-overlay-contact">
          <h4>Contact</h4>
          <a href="mailto:goyacurtain@gmail.com">goyacurtain@gmail.com</a>
          <a href="https://www.instagram.com/goyacurtain/">Instagram</a>
        </div>
      </div>
    </>
  );
}
