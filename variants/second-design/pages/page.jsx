import Hero from "../components/Hero/Hero";
import Segments from "../components/Segments/Segments";
import Products from "../components/Products/Products";
import Calculator from "../components/Calculator/Calculator";
import MobileBank from "../components/MobileBank/MobileBank";
import Rates from "../components/Rates/Rates";
import Locations from "../components/Locations/Locations";
import News from "../components/News/News";
import Footer from "../components/Footer/Footer";
export default function Home() {
  return <>
      <main>
        <Hero />
        <Segments />
        <Products />
        <Calculator />
        <MobileBank />
        <Rates />
        <Locations />
        <News />
      </main>
      <Footer />
    </>;
}
