import Link from "next/link";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="text-sm text-gray-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {c.href ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-900">{c.label}</span>
            )}
            {i < items.length - 1 ? (
              <span className="text-gray-400">/</span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
