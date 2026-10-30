import {cookies} from 'next/headers';

export async function readDesignPreference(searchParams){
  const query=await searchParams;
  const requested=Number(query?.v);
  if(requested===1||requested===2)return requested;
  const saved=Number((await cookies()).get('credo-design')?.value);
  return saved===2?2:1;
}
