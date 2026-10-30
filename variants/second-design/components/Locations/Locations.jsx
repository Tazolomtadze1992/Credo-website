"use client";

import { useState } from "react";
import styles from "./Locations.module.css";
const FILTERS = [{
  id: "service",
  label: "სერვისცენტრი"
}, {
  id: "atm",
  label: "ბანკომატი"
}, {
  id: "cash",
  label: "სალარო"
}];
const CITIES = ["ყველა", "თბილისი"];
const LOCATIONS = [{
  city: "თბილისი",
  address: "თაბუკაშვილის ქ. N27",
  hours: "ორშ-პარ 10:00-17:30 • შაბ 10:15-12:15"
}, {
  city: "თბილისი",
  address: "აღმაშენებლის გამზირი N55",
  hours: "ორშ-პარ 10:00-17:30 • შაბ 10:15-12:15"
}, {
  city: "თბილისი",
  address: "ვაკის ექსპატ ს/ც, ი.ჭავჭავაძის გამზ. N16",
  hours: "ორშ-პარ 10:00-17:30 • შაბ 10:15-12:15",
  badge: "ექსპატ ცენტრი"
}];

// Marker positions inside the 1288 × 406 map frame (Figma 918:1930)
const BRANCH_MARKERS = [[439, 168], [167, 311], [241, 173], [596, 124], [975, 216], [449, 288]];
const ATM_MARKERS = [[620, 161], [463, 192], [497, 288], [215, 311]];
export default function Locations({
  title = "ფილიალები და ბანკომატები"
}) {
  const [city, setCity] = useState(CITIES[0]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(null);
  const [selected, setSelected] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(true);
  const needle = query.trim().toLowerCase();
  const visible = LOCATIONS.map((location, index) => ({
    ...location,
    index
  })).filter(location => (city === CITIES[0] || location.city === city) && (!needle || `${location.city} ${location.address}`.toLowerCase().includes(needle)));
  const markerDimmed = type => filter !== null && filter !== type;
  return <section className={styles.section} id="locations" aria-labelledby="locations-title">
      <div className={styles.heading}>
        <h2 id="locations-title" className={styles.title}>
          {title}
        </h2>
        <div className={styles.inputs}>
          <label className={styles.city}>
            <span className={styles.cityText}>
              <span className={styles.cityLabel}>აირჩიე ქალაქი</span>
              <span className={styles.cityValue}>{city}</span>
            </span>
            <img src="/design-two/icons/select-chevron.svg" width={20} height={20} alt="" />
            <select value={city} onChange={e => setCity(e.target.value)} aria-label="აირჩიე ქალაქი">
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className={styles.search}>
            <input type="search" placeholder="მიუთითე სასურველი ლოკაცია" aria-label="მიუთითე სასურველი ლოკაცია" value={query} onChange={e => setQuery(e.target.value)} />
            <img src="/design-two/icons/search-20.svg" width={20} height={20} alt="" />
          </label>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.panel}>
          <div className={styles.filters} role="group" aria-label="ლოკაციის ტიპი">
            {FILTERS.map(f => <button key={f.id} className={`${styles.filter} ${filter === f.id ? styles.filterActive : ""}`} aria-pressed={filter === f.id} onClick={() => setFilter(filter === f.id ? null : f.id)}>
                {f.label}
              </button>)}
          </div>

          <ul className={styles.list}>
            {visible.map(location => {
            const isSelected = location.index === selected;
            return <li key={location.address}>
                  <button className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`} aria-pressed={isSelected} onClick={() => {
                setSelected(location.index);
                setTooltipOpen(true);
              }}>
                    <span className={styles.slot}>
                      <img src={isSelected ? "/design-two/icons/pin-white.svg" : "/design-two/icons/pin-blue.svg"} width={20} height={20} alt="" />
                    </span>
                    <span className={styles.itemText}>
                      <span className={styles.itemCity}>{location.city}</span>
                      <span className={styles.itemAddress}>{location.address}</span>
                      <span className={styles.itemHours}>{location.hours}</span>
                      {location.badge && <span className={styles.itemBadge}>{location.badge}</span>}
                    </span>
                  </button>
                </li>;
          })}
            {visible.length === 0 && <li className={styles.empty}>ლოკაცია ვერ მოიძებნა</li>}
          </ul>
        </div>

        <div className={styles.map}>
          <div className={styles.mapImage} style={{
          maskImage: 'url("/design-two/images/locations/map-mask.svg")'
        }}>
            <img src="/design-two/images/locations/map.png" alt="ფილიალებისა და ბანკომატების რუკა" />
          </div>

          {BRANCH_MARKERS.map(([left, top]) => <button key={`b-${left}-${top}`} className={`${styles.marker} ${markerDimmed("service") ? styles.markerDimmed : ""}`} style={{
          left,
          top
        }} aria-label="სერვისცენტრი" onClick={() => setTooltipOpen(true)}>
              <img className={styles.branchPin} src="/design-two/images/locations/marker-branch.svg" alt="" />
              <span className={styles.branchLogo} style={{
            maskImage: 'url("/design-two/images/locations/credo-logo-mask.png")'
          }} />
            </button>)}
          {ATM_MARKERS.map(([left, top]) => <button key={`a-${left}-${top}`} className={`${styles.marker} ${markerDimmed("atm") ? styles.markerDimmed : ""}`} style={{
          left,
          top
        }} aria-label="ბანკომატი" onClick={() => setTooltipOpen(true)}>
              <img src="/design-two/images/locations/marker-atm.svg" width={48} height={48} alt="" />
            </button>)}

          <img className={styles.yourLocation} src="/design-two/images/locations/your-location.svg" alt="" aria-hidden="true" />

          {tooltipOpen && <div className={styles.tooltip} role="dialog" aria-label="გოგი ცაბაძის #11">
              <img className={styles.pointer} src="/design-two/images/locations/tooltip-pointer.svg" width={58} height={6} alt="" />
              <div className={styles.tooltipBox}>
                <div className={styles.tooltipHead}>
                  <div className={styles.tooltipTitle}>
                    <span className={styles.tooltipSlot}>
                      <img src="/design-two/icons/atm.svg" width={20} height={20} alt="" />
                    </span>
                    <span className={styles.tooltipName}>
                      <strong>გოგი ცაბაძის #11</strong>
                      <span>ბანკომატი</span>
                    </span>
                  </div>
                  <button className={styles.close} onClick={() => setTooltipOpen(false)} aria-label="დახურვა">
                    <img src="/design-two/icons/close.svg" width={20} height={20} alt="" />
                  </button>
                </div>
                <div className={styles.tooltipSection}>
                  <span className={styles.overline}>
                    <img src="/design-two/icons/directions.svg" width={20} height={20} alt="" />
                    {/* Overline is CAPS: written in Mtavruli */}
                    <span aria-label="მისამართი">ᲛᲘᲡᲐᲛᲐᲠᲗᲘ</span>
                  </span>
                  <p className={styles.address}>
                    თბილისი, გოგი ცაბაძის ქუჩა #11
                    <br />
                    (ლუკა პოლარეს გვერდით)
                  </p>
                </div>
              </div>
            </div>}
        </div>
      </div>
    </section>;
}
