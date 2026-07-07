import { supabase } from "./supabaseClient.js";

// Expected Supabase tables:
//
// users
//   id            uuid, primary key, default gen_random_uuid()
//   email         text, unique
//   name          text, nullable
//   password_hash text, nullable (null for Google-only accounts)
//   provider      text, "password" | "google"
//   created_at    timestamptz, default now()
//
// merchants
//   id            uuid, primary key, default gen_random_uuid()
//   user_id       uuid, references users(id)
//   name          text
//   account_no    text
//   merchant_id   text

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createUser = async ({ email, name, passwordHash, provider }) => {
  const { data, error } = await supabase
    .from("users")
    .insert({ email, name, password_hash: passwordHash, provider })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Updates whichever fields are provided. Email uniqueness and password
// hashing are handled by the caller (route) before this is called.
export const updateUser = async (id, { name, email, passwordHash }) => {
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (passwordHash !== undefined) updates.password_hash = passwordHash;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const findMerchantByUserId = async (userId) => {
  const { data, error } = await supabase
    .from("merchants")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const upsertMerchant = async ({ userId, name, accountNo, merchantId }) => {
  const { data, error } = await supabase
    .from("merchants")
    .upsert(
      { user_id: userId, name, account_no: accountNo, merchant_id: merchantId },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
};
