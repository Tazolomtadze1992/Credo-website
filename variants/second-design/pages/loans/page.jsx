import FeaturedLoans from "../../components/Loans/FeaturedLoans";
import Mortgage from "../../components/Loans/Mortgage";
import Calculator from "../../components/Calculator/Calculator";
import OtherLoans from "../../components/Loans/OtherLoans";
import Footer from "../../components/Footer/Footer";
export const metadata = {
  title: "სესხები — კრედო ბანკი",
  description: "სამომხმარებლო, ავტო, იპოთეკური და სხვა სესხები კრედო ბანკში"
};
export default function LoansPage() {
  return <>
      <main>
        <FeaturedLoans />
        <Mortgage />
        <Calculator loanOnly note="გაანგარიშება საილუსტრაციოა. ზუსტ პირობებს — მათ შორის ეფექტურ საპროცენტო განაკვეთს — განაცხადის შემდეგ მიიღებ." />
        <OtherLoans />
      </main>
      <Footer />
    </>;
}
