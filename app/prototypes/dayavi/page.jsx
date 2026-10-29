import DayaviPreview from './preview';

export const metadata = {
  title: 'და-ყა-ვი · კრედო ბანკი',
  description: 'შეიძინე სასურველი ნივთი თუ მომსახურება და გადაანაწილე გადასახადი 8 თვემდე.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  const requested = Number.parseInt(query?.v, 10);
  const initialVariant = requested >= 1 && requested <= 3 ? requested - 1 : 0;
  return <DayaviPreview initialVariant={initialVariant} />;
}
