import styles from "./StoreButtons.module.css";

// TODO: replace "#" with the Credo app's Google Play / App Store URLs
export default function StoreButtons() {
  return <div className={styles.stores}>
      <a href="#" className={`${styles.store} ${styles.storePlay}`} aria-label="Get it on Google Play">
        <img src="/design-two/icons/google-play.svg" width={21} height={24} alt="" />
        <span className={styles.playContent}>
          <span className={styles.playEyebrow}>GET IT ON</span>
          <img className={styles.playWordmark} src="/design-two/icons/google-play-wordmark.svg" width={74} height={15} alt="" />
        </span>
      </a>
      <a href="#" className={`${styles.store} ${styles.storeApple}`} aria-label="Download on the App Store">
        <img src="/design-two/icons/apple.svg" width={20} height={24} alt="" />
        <span className={styles.appleContent}>
          <span className={styles.appleEyebrow}>Download on the</span>
          <span className={styles.appleName}>App Store</span>
        </span>
      </a>
    </div>;
}
