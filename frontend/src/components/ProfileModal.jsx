import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMerchantProfile, updateMerchantProfile } from "../api/client";
import { getUser, logout, updateProfile } from "../api/auth";
import InitialsAvatar from "./InitialsAvatar";

const ICONS = {
  edit: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17H7A5 5 0 0 1 7 7h2" />
      <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
      <path d="M8 12h8" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-5M12 8h.01" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  ),
  back: (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
};

export default function ProfileModal({ open, onClose }) {
  const [view, setView] = useState("menu"); // "menu" | "edit" | "link"
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(getUser());
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    setView("menu");
    setError("");
    setUser(getUser());

    const load = async () => {
      setLoading(true);
      try {
        const data = await getMerchantProfile();
        setMerchant(data);
      } catch (err) {
        setError(err.message || "Could not load merchant details");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  if (!open) return null;

  const closeAndReset = () => {
    setView("menu");
    onClose();
  };

  const goToAbout = () => {
    onClose();
    navigate("/about");
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay"
      onClick={closeAndReset}
    >
      <div className="profile" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close modal-close--inline"
          onClick={closeAndReset}
          aria-label="Close"
        >
          ✕
        </button>

        {view === "menu" && (
          <MenuView
            user={user}
            merchant={merchant}
            loading={loading}
            error={error}
            onEdit={() => setView("edit")}
            onLink={() => setView("link")}
            onAbout={goToAbout}
            onLogout={handleLogout}
          />
        )}

        {view === "edit" && (
          <EditDetailsView
            user={user}
            onBack={() => setView("menu")}
            onSaved={(updated) => {
              setUser(updated);
              setView("menu");
            }}
          />
        )}

        {view === "link" && (
          <LinkMerchantView
            merchant={merchant}
            onBack={() => setView("menu")}
            onSaved={(updated) => {
              setMerchant(updated);
              setView("menu");
            }}
          />
        )}
      </div>
    </div>
  );
}

function MenuView({ user, merchant, loading, error, onEdit, onLink, onAbout, onLogout }) {
  const isLinked = merchant && merchant.merchantId && merchant.merchantId !== "Not set";

  return (
    <>
      <div className="profile-hero">
        <InitialsAvatar name={user?.name} email={user?.email} size={70} className="profile-avatar" />
        <div>
          <div className="profile-name">{user?.name || "Merchant"}</div>
          <div className="profile-email">{user?.email}</div>
          {isLinked && <span className="profile-merchant">{merchant.merchantId}</span>}
        </div>
      </div>

      {loading && <p style={{ opacity: 0.7, fontSize: "0.85rem" }}>Loading merchant details...</p>}
      {error && <p style={{ color: "#e5484d", fontSize: "0.85rem" }}>{error}</p>}

      {!loading && !error && merchant && (
        <div className="profile-section">
          <span className="profile-section-title">Merchant account</span>
          <div className="profile-stats">
            <div className="pstat">
              <div className="pstat-label">Business name</div>
              <div className="pstat-value" style={{ fontSize: "15px" }}>{merchant.name}</div>
            </div>
            <div className="pstat">
              <div className="pstat-label">Account no.</div>
              <div className="pstat-value" style={{ fontSize: "15px" }}>{merchant.accountNo}</div>
            </div>
          </div>
        </div>
      )}

      <div className="profile-section">
        <span className="profile-section-title">Settings</span>
        <ul className="profile-menu">
          <li>
            <button type="button" onClick={onEdit}>
              {ICONS.edit} Edit my details
            </button>
          </li>
          <li>
            <button type="button" onClick={onLink}>
              {ICONS.link} {isLinked ? "Update linked merchant account" : "Link merchant account"}
            </button>
          </li>
          <li>
            <button type="button" onClick={onAbout}>
              {ICONS.about} About PayTrace
            </button>
          </li>
        </ul>
      </div>

      <button type="button" className="btn-signin" style={{ width: "100%" }} onClick={onLogout}>
        {ICONS.logout} Log out
      </button>
    </>
  );
}

function EditDetailsView({ user, onBack, onSaved }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && !currentPassword) {
      setError("Enter your current password to set a new one.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      setSuccess("Details updated.");
      setCurrentPassword("");
      setNewPassword("");
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Could not update details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="profile-hero" style={{ alignItems: "center" }}>
        <button type="button" onClick={onBack} className="modal-close" style={{ position: "static" }} aria-label="Back">
          {ICONS.back}
        </button>
        <div className="profile-name" style={{ fontSize: "18px" }}>Edit my details</div>
      </div>

      <div className="profile-section" style={{ display: "grid", gap: "0.85rem" }}>
        <label className="field">
          <span className="field-label">Full name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span className="field-label">Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <span className="profile-section-title" style={{ marginTop: "0.25rem" }}>
          Change password (optional)
        </span>

        <label className="field">
          <span className="field-label">Current password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Only needed if setting a new password"
          />
        </label>

        <label className="field">
          <span className="field-label">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters, mixed case + a number"
          />
        </label>

        {error && <p style={{ color: "#e5484d", fontSize: "0.85rem", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "var(--green)", fontSize: "0.85rem", margin: 0 }}>{success}</p>}

        <button type="submit" className="btn-signin" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function LinkMerchantView({ merchant, onBack, onSaved }) {
  const [name, setName] = useState(merchant?.name && merchant.name !== "Not set" ? merchant.name : "");
  const [accountNo, setAccountNo] = useState(
    merchant?.accountNo && merchant.accountNo !== "Not set" ? merchant.accountNo : "",
  );
  const [merchantId, setMerchantId] = useState(
    merchant?.merchantId && merchant.merchantId !== "Not set" ? merchant.merchantId : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await updateMerchantProfile({ name, accountNo, merchantId });
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Could not link merchant account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="profile-hero" style={{ alignItems: "center" }}>
        <button type="button" onClick={onBack} className="modal-close" style={{ position: "static" }} aria-label="Back">
          {ICONS.back}
        </button>
        <div className="profile-name" style={{ fontSize: "18px" }}>Link merchant account</div>
      </div>

      <p style={{ fontSize: "0.85rem", opacity: 0.75, marginTop: 0 }}>
        Enter the business name, settlement account number, and merchant ID from your
        Nomba merchant dashboard. Once linked, payments to that account will show up
        here automatically.
      </p>

      <div className="profile-section" style={{ display: "grid", gap: "0.85rem" }}>
        <label className="field">
          <span className="field-label">Business name</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label className="field">
          <span className="field-label">Settlement account number</span>
          <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} required />
        </label>

        <label className="field">
          <span className="field-label">Nomba merchant ID</span>
          <input
            type="text"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            placeholder="e.g. NMB-18014"
            required
          />
        </label>

        {error && <p style={{ color: "#e5484d", fontSize: "0.85rem", margin: 0 }}>{error}</p>}

        <button type="submit" className="btn-signin" disabled={saving}>
          {saving ? "Linking..." : "Save & link account"}
        </button>
      </div>
    </form>
  );
}
