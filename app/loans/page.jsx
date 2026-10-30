import Page, { metadata } from '../../variants/second-design/pages/loans/page.jsx';
import SecondDesign from '../../variants/second-design/SecondDesign.jsx';
import DesignComparison from '../../components/design-comparison/DesignComparison.jsx';
export { metadata };
export default function SecondDesignPage(){return <DesignComparison initialDesign={2} other={<SecondDesign><Page/></SecondDesign>}/>;}
