import styles from "./Button.module.css";
/** Renders a <button>, or an <a> with the same look when given an href. */
export default function Button(props) {
  const {
    variant = "primary",
    size = "small",
    className,
    children,
    ...rest
  } = props;
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");
  if (rest.href !== undefined) {
    return <a className={classes} {...rest}>
        {children}
      </a>;
  }
  return <button type="button" className={classes} {...rest}>
      {children}
    </button>;
}
