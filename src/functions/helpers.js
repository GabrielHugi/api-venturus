import {Usuario } from '../../models/Modelos.js';
import { config } from 'dotenv';
import encryptjs from "encryptjs";
const encrypt = encryptjs.encrypt;
const decrypt = encryptjs.decrypt;

config();
const secretKey = process.env.SECRET_KEY;

export function isValidUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') return false;
  const re = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89ABab][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
  return re.test(uuid);
}

export async function getUserByEmail(email) {
  if (!email) return null;
  return await Usuario.findOne({ where: { email } });
}

export function safeDecrypt(user) {
  if (!user || !user.senha) return null;
  try {
    return decrypt(user.senha, secretKey, 256);
  } catch (err) {
    console.error("safeDecrypt error:", err);
    return null;
  }
}

export async function requireAdmin(email, senha) {
  const user = await getUserByEmail(email);
  if (!user) return { ok: false, code: 401, erro: "Usuário não encontrado" };
  const dec = safeDecrypt(user);
  if (!dec || dec !== senha || !user.administrador) {
    return { ok: false, code: 403, erro: "Acesso não autorizado" };
  }
  return { ok: true, user };
}
