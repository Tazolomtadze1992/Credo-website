import SlicePreview from './preview';

export const metadata = {
  title: 'და-ყა-ვი · Slice exploration',
  description: 'და-ყა-ვის ქაღალდის გაყოფის ვარიანტების შედარება.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  const requested = Number.parseInt(query?.v, 10);
  const initialVariant = requested >= 1 && requested <= 3 ? requested - 1 : 0;
  const presentation = query?.present === '1';
  return <SlicePreview initialVariant={initialVariant} presentation={presentation} />;
}
