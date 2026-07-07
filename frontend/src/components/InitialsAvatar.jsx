// Renders a colored circle with a person's initials — used wherever we'd
// otherwise need a profile photo. Falls back to the email if no name is set.
const getInitials = (label) => {
  const trimmed = (label || "").trim();
  if (!trimmed) return "?";

  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const colorFromString = (label) => {
  const text = label || "?";
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 58%, 42%)`;
};

export default function InitialsAvatar({ name, email, size = 44, className = "" }) {
  const label = (name && name.trim()) || email || "";
  const initials = getInitials(label);
  const background = colorFromString(label);

  return (
    <div
      className={`initials-avatar ${className}`}
      style={{
        width: size,
        height: size,
        background,
        fontSize: Math.round(size * 0.38),
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
