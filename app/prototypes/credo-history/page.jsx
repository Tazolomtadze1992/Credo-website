import Preview from './preview';
export const metadata = {title:'კრედოს ისტორია · ვარიანტები',description:'კრედო ბანკის ისტორია 1997 წლიდან დღემდე. რეალურ საარქივო მასალაზე დაფუძნებული ინტერაქტიული პროტოტიპი.'};
export default async function Page({searchParams}){const query=await searchParams;const requested=Number.parseInt(query?.v,10);return <Preview initialVariant={requested>=1&&requested<=3?requested-1:0}/>}
