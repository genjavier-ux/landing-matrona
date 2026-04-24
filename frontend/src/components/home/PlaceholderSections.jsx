import { SectionShell } from '../ui';

export default function PlaceholderSections({ sections }) {
  return sections.map((section) => (
    <SectionShell
      key={section.id}
      id={section.id}
      className="clean-placeholder-section clean-scroll-section"
      data-section-id={section.id}
    >
      <div className="clean-placeholder-copy">
        <h2>{section.label}</h2>
      </div>
    </SectionShell>
  ));
}
