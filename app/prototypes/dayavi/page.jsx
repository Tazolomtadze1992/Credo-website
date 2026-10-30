import DayaviPreview from './preview';

export const metadata = {
  title: 'და-ყა-ვი · კრედო ბანკი',
  description: 'შეიძინე სასურველი ნივთი თუ მომსახურება და გადაანაწილე გადასახადი 8 თვემდე.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  const requested = Number.parseInt(query?.v, 10);
  // Keep previously shared Slice links working after removing Cut and Orb.
  const initialVariant = requested === 7 ? 4 : requested >= 1 && requested <= 5 ? requested - 1 : 0;
  return <DayaviPreview initialVariant={initialVariant} />;
}
