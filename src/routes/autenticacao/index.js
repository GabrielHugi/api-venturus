import '../../functions/helpers.js';
import express from 'express';
import { getUserByEmail, safeDecrypt } from '../../functions/helpers.js';
const router = express.Router();

router.post('/autenticacao', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email|| !senha) return res.status(400).json({erro: "Email ou senha não presentes"});

    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ erro: "Email ou senha inválidos." });
    const decryptedPassword = safeDecrypt(user);
    if (!decryptedPassword || senha !== decryptedPassword) return res.status(401).json({ erro: "Email ou senha inválidos." });

    return res.status(200).json({ mensagem: "Login bem-sucedido!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno ao tentar fazer o login." });
  }
});

export default router;