import { ExpatsHero, ExpatProducts, ExpatOffers } from "../../components/Expats/Expats";
import MobileBank from "../../components/MobileBank/MobileBank";
import Locations from "../../components/Locations/Locations";
import Footer from "../../components/Footer/Footer";
export const metadata = {
  title: "კრედო ექსპატებისთვის — კრედო ბანკი",
  description: "სპეციალური სერვისები და ექსპატ სერვისცენტრები საქართველოში მცხოვრები უცხო ქვეყნის მოქალაქეებისთვის."
};
export default function ExpatsPage() {
  return <>
      <main>
        <ExpatsHero />
        <ExpatProducts />
        <MobileBank phoneImage="/design-two/images/expats/mobile-phone.png" />
        <ExpatOffers />
        <Locations title="ექსპატ სერვის ცენტრები" />
      </main>
      <Footer />
    </>;
}
