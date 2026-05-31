"""
Utilitaire d'envoi d'email de confirmation de rendez-vous.
Utilisé par : POST /agenda/appointments (Membre 1 → Membre 2)
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime


# ─────────────────────────────────────────────────────
# Config SMTP (lue depuis les variables d'environnement)
# ─────────────────────────────────────────────────────

SMTP_HOST     = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER", "")          # ex: monapp@gmail.com
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")      # mot de passe ou App Password
FRONTEND_URL  = os.getenv("FRONTEND_URL", "http://localhost:3000")


# ─────────────────────────────────────────────────────
# Fonction principale
# ─────────────────────────────────────────────────────

def send_confirmation_email(
    to_email: str,
    nom_patient: str,
    prenom_patient: str,
    date_rdv: str,          # ex: "2025-06-15"
    heure_rdv: str,         # ex: "09:30"
    medecin_nom: str,       # ex: "Dr. Martin"
    token_modification: str,
    cancel_token: str,
) -> None:
    """
    Envoie un email HTML de confirmation de rendez-vous contenant :
    - Un lien pour MODIFIER le rendez-vous
    - Un lien pour ANNULER le rendez-vous

    Les liens pointent vers le frontend React (Membre 3) :
      - Modifier : {FRONTEND_URL}/rdv/{token_modification}/modifier
      - Annuler  : {FRONTEND_URL}/rdv/{cancel_token}/annuler
    """

    lien_modifier = f"{FRONTEND_URL}/rdv/{token_modification}/modifier"
    lien_annuler  = f"{FRONTEND_URL}/rdv/{cancel_token}/annuler"

    sujet = f"✅ Confirmation de votre rendez-vous — {date_rdv} à {heure_rdv}"

    corps_html = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body       {{ font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }}
        .container {{ max-width:600px; margin:40px auto; background:#fff;
                      border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.1); }}
        .header    {{ background:#1a73e8; color:#fff; padding:30px; text-align:center; }}
        .header h1 {{ margin:0; font-size:22px; }}
        .body      {{ padding:30px; color:#333; }}
        .info-box  {{ background:#f0f4ff; border-left:4px solid #1a73e8;
                      padding:15px 20px; border-radius:4px; margin:20px 0; }}
        .info-box p {{ margin:5px 0; font-size:15px; }}
        .btn       {{ display:inline-block; padding:14px 28px; border-radius:6px;
                      text-decoration:none; font-size:15px; font-weight:bold;
                      margin:8px 4px; }}
        .btn-modifier {{ background:#1a73e8; color:#fff; }}
        .btn-annuler  {{ background:#fff; color:#d93025; border:2px solid #d93025; }}
        .actions   {{ text-align:center; margin:30px 0; }}
        .footer    {{ background:#f4f4f4; text-align:center; padding:15px;
                      font-size:12px; color:#888; }}
        .warning   {{ font-size:12px; color:#888; margin-top:20px; }}
      </style>
    </head>
    <body>
      <div class="container">

        <div class="header">
          <h1>Confirmation de rendez-vous</h1>
        </div>

        <div class="body">
          <p>Bonjour <strong>{prenom_patient} {nom_patient}</strong>,</p>
          <p>Votre rendez-vous a bien été enregistré. Voici le récapitulatif :</p>

          <div class="info-box">
            <p>🩺 <strong>Médecin :</strong> {medecin_nom}</p>
            <p>📅 <strong>Date :</strong> {date_rdv}</p>
            <p>🕐 <strong>Heure :</strong> {heure_rdv}</p>
          </div>

          <p>Vous pouvez gérer votre rendez-vous via les boutons ci-dessous :</p>

          <div class="actions">
            <a href="{lien_modifier}" class="btn btn-modifier">✏️ Modifier le rendez-vous</a>
            <a href="{lien_annuler}"  class="btn btn-annuler" >❌ Annuler le rendez-vous</a>
          </div>

          <p class="warning">
            ⚠️ Ces liens expirent <strong>24h avant</strong> votre rendez-vous.<br>
            Passé ce délai, veuillez nous contacter directement par téléphone.
          </p>
        </div>

        <div class="footer">
          Cet email a été envoyé automatiquement — merci de ne pas y répondre.
        </div>

      </div>
    </body>
    </html>
    """

    # Corps texte brut (fallback pour clients sans HTML)
    corps_texte = (
        f"Bonjour {prenom_patient} {nom_patient},\n\n"
        f"Votre rendez-vous est confirmé :\n"
        f"  Médecin : {medecin_nom}\n"
        f"  Date    : {date_rdv}\n"
        f"  Heure   : {heure_rdv}\n\n"
        f"Modifier  : {lien_modifier}\n"
        f"Annuler   : {lien_annuler}\n\n"
        f"Ces liens expirent 24h avant votre rendez-vous."
    )

    # Construction du message MIME
    msg = MIMEMultipart("alternative")
    msg["Subject"] = sujet
    msg["From"]    = SMTP_USER
    msg["To"]      = to_email

    msg.attach(MIMEText(corps_texte, "plain", "utf-8"))
    msg.attach(MIMEText(corps_html,  "html",  "utf-8"))

    # Envoi SMTP
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())
