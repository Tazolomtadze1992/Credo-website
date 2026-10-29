import './globals.css';
import './bento-hover.css';
import './card-ribbon.css';
import './navigation.css';
export const metadata = {
  title: 'კრედო ბანკი · Website redesign',
  description: 'Credo Bank homepage design prototype.'
};
export default function RootLayout({ children }) {
  return <html lang="ka" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
