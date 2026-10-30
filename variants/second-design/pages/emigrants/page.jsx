import { EmigrantsHero, EmigrantOffers, EmigrantProducts } from "../../components/Emigrants/Emigrants";
import MobileBank from "../../components/MobileBank/MobileBank";
import Footer from "../../components/Footer/Footer";
export const metadata = {
  title: "კრედო ემიგრანტებისთვის — კრედო ბანკი",
  description: "საბანკო მომსახურება ემიგრანტებისთვის: ანაბრები, სესხები, გზავნილები და ვიდეობანკინგი."
};
export default function EmigrantsPage() {
  return <>
      <main>
        <EmigrantsHero />
        <EmigrantOffers />
        <MobileBank phoneImage="/design-two/images/emigrants/mobile-phone.png" movingLetters />
        <EmigrantProducts />
      </main>
      <Footer />
    </>;
}
