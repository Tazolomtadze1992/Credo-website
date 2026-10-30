import DigitalLoanHero from "../../../components/Loans/DigitalLoanHero";
import Calculator from "../../../components/Calculator/Calculator";
import Faq from "../../../components/Loans/Faq";
import Footer from "../../../components/Footer/Footer";
export const metadata = {
  title: "ციფრული სესხი — კრედო ბანკი",
  description: "მიიღე 70 000 ლარამდე სესხი ციფრულად - 30 წუთში, 24/7 ზე, შაბათ-კვირის ჩათვლით."
};
export default function DigitalLoanPage() {
  return <>
      <main>
        <DigitalLoanHero />
        <Calculator loanOnly startingFrom note="გაანგარიშება საილუსტრაციოა. ზუსტ პირობებს — მათ შორის ეფექტურ საპროცენტო განაკვეთს — განაცხადის შემდეგ მიიღებ." />
        <Faq />
      </main>
      <Footer />
    </>;
}
