import LoanPreview from './preview';
import { legacyComparisonId } from './versions/catalog';

export const metadata = {
  title: 'ციფრული სესხი · Shader study',
  description: 'An isolated Credo loan card shader study. The homepage is unchanged.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  const compare = query.compare === '1';
  const against = query.against || (compare ? legacyComparisonId(query.version) : undefined);
  return <LoanPreview initialVersion={query.version} initialCompare={compare} initialAgainst={against} />;
}
