import SharedBentoPreview from './preview';

export const metadata = {
  title: 'Credo · Shared bento studies',
  description: 'Saved versions of the shared loan and და-ყა-ვი background.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <SharedBentoPreview initialVersion={query.version} initialCompare={query.compare === '1'} />;
}
