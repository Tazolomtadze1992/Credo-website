'use client';
import { useMemo } from 'react';
import { Lifeline } from './vendor/lifeline';
import { milestones, archive, sources } from './content';

export default function Timeline({ direction, startAt = 'end' }) {
  const markers = useMemo(() => {
    const years = direction === 'credo' ? milestones.map(m => m.year) : Array.from({length:30},(_,i)=>1997+i);
    return years.map(year => {
      const m=milestones.find(x=>x.year===year);
      if(!m)return {id:`year-${year}`,year,events:[]};
      const media=archive.find(x=>x.file===m.image);
      const image=media ? {nativeWidth:media.width,src:`/assets/history/${media.file.replace(/\.[^.]+$/,'.webp')}`,alt:`${media.caption} · ${media.year}${media.page ? ` · ანგარიში, გვერდი ${media.page}`:''}`} : undefined;
      const text=[{type:'link',value:m.title,href:sources[m.sourceId].url},{type:'text',value:`. ${m.text}`}];
      // The quiet direction reveals most media on hover. Credo makes the archive the foreground.
      const floating=image && (direction==='credo' || [2009,2013,2016,2024,2026].includes(year));
      return {id:`credo-${year}`,year,presentation:direction,events:[{text,image:!floating?image:undefined}],photos:floating?[{...image,x:0,y:direction==='credo'?154:142,width:direction==='credo'?260:186,rotate:direction==='credo'?(year%2? -2:2):undefined}]:[]};
    });
  },[direction]);
  return <div className={`history-timeline lf-scope history-${direction}`}>
    <Lifeline startAt={startAt} markers={markers} birthYear={1997} mode="page" title="კრედოს ისტორია — 1997 წლიდან დღემდე" />
  </div>;
}
