import AutoLoan from './auto-loan-client';
import { resolveProduct } from './loan-data.mjs';

export const metadata = {
  title: 'ავტო სესხი · კრედო ბანკი',
  description: 'შეიძინე ახალი ან მეორადი ავტომობილი, ან მიიღე თანხა შენი ავტომობილის უზრუნველყოფით.',
};

export default async function Page({ searchParams }) {
  const query = await searchParams;
  return <AutoLoan initialType={resolveProduct(query?.type).id} />;
}
