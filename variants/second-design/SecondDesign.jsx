import SiteHeader from '../../components/SiteHeader';
import './globals.css';

export default function SecondDesign({children}) {
  return <><SiteHeader design={2}/><div className="design-two">{children}</div></>;
}
