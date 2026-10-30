import StoreButtons from "../StoreButtons/StoreButtons";
import styles from "./Footer.module.css";
const LINK_GROUPS = [{
  title: "ჩვენ შესახებ",
  links: ["კრედოს შესახებ", "მმართველობა", "ფინანსური მაჩვენებლები", "კარიერა", "მედია", "აქციონერთა კრება", "ეკო-სოციალური ჰაბი"]
}, {
  title: "დახმარება",
  links: ["პირობები და ტარიფები", "გაცვლითი კურსი", "მომხმარებლის სახელმძღვანელო", "პრეტენზიების მართვა"]
}];
const CONTACTS = [{
  icon: "phone",
  label: "+995 32 2 42 42 42",
  href: "tel:+995322424242"
}, {
  icon: "chat",
  label: "ჩატი",
  href: "#"
}, {
  icon: "location",
  label: "მისამართები",
  href: "/?v=2#locations"
}, {
  icon: "mail",
  label: "info@credo.ge",
  href: "mailto:info@credo.ge"
}];
const SOCIALS = [{
  icon: "whatsapp",
  label: "WhatsApp"
}, {
  icon: "facebook",
  label: "Facebook"
}, {
  icon: "linkedin",
  label: "LinkedIn"
}, {
  icon: "instagram",
  label: "Instagram"
}, {
  icon: "youtube",
  label: "YouTube"
}];
export default function Footer() {
  return <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          {LINK_GROUPS.map(group => <nav key={group.title} className={styles.column} aria-label={group.title}>
              <h2 className={styles.heading}>{group.title}</h2>
              <ul className={styles.links}>
                {group.links.map(link => <li key={link}>
                    <a href="#">{link}</a>
                  </li>)}
              </ul>
            </nav>)}

          <div className={`${styles.column} ${styles.contactColumn}`}>
            <div className={styles.contact}>
              <h2 className={styles.heading}>დაგვიკავშირდი</h2>
              <ul className={styles.contacts}>
                {CONTACTS.map(contact => <li key={contact.icon}>
                    <a href={contact.href}>
                      <img src={`/design-two/icons/footer/${contact.icon}.svg`} width={20} height={20} alt="" />
                      {contact.label}
                    </a>
                  </li>)}
              </ul>
              <ul className={styles.socials}>
                {SOCIALS.map(social => <li key={social.icon}>
                    <a href="#" aria-label={social.label}>
                      <img src={`/design-two/icons/footer/${social.icon}.svg`} width={20} height={20} alt="" />
                    </a>
                  </li>)}
              </ul>
            </div>

            <div className={styles.download}>
              <h2 className={styles.heading}>გადმოწერე მობაილბანკი</h2>
              <StoreButtons />
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <div className={styles.brand}>
            <a href="/?v=2" className={styles.logo} aria-label="კრედო ბანკი">
              <img src="/design-two/icons/footer/logo-mark.svg" width={29.1228} height={29.1778} alt="" />
            </a>
            <p>კრედო ბანკი - ყველა უფლება დაცულია</p>
          </div>
          <div className={styles.legal}>
            <a href="#">მომსახურების პირობები</a>
            <a href="#">მონაცემთა დაცვა</a>
          </div>
        </div>
      </div>
    </footer>;
}
