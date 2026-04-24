export default function NoticeBanner({ children, className = 'notice' }) {
  return <p className={className}>{children}</p>;
}
