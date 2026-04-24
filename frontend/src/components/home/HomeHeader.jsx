import { MenuNav } from '../ui';

export default function HomeHeader({ navItems, activeSection, onSelect }) {
  return (
    <header className="clean-nav">
      <MenuNav items={navItems} activeId={activeSection} onSelect={onSelect} />

      <a href="/admin" className="clean-login-link">
        Login
      </a>
    </header>
  );
}
