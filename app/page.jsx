import OurWebsite from '../components/OurWebsite';
import OtherWebsite from '../variants/second-design/pages/page';
import SecondDesign from '../variants/second-design/SecondDesign';
import DesignComparison from '../components/design-comparison/DesignComparison';
import {readDesignPreference} from '../lib/read-design-preference';

export default async function Home({searchParams}) {
  const initialDesign=await readDesignPreference(searchParams);
  return <DesignComparison initialDesign={initialDesign} ours={<OurWebsite/>} other={<SecondDesign><OtherWebsite/></SecondDesign>}/>;
}
