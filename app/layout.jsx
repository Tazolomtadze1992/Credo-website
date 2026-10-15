import './globals.css';
import './bento-hover.css';
import './card-ribbon.css';
export const metadata = {
  title: 'კრედო ბანკი · Website redesign',
  description: 'Credo Bank homepage design prototype.'
};
export default function RootLayout({ children }) {
  return <html lang="ka"><body>{children}</body></html>;
}
