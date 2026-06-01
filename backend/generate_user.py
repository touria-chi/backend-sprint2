from passlib.context import CryptContext
import psycopg2

ctx = CryptContext(schemes=["argon2"], deprecated="auto")
h = ctx.hash("0000")
print("Hash:", h)

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="ophtaadmin",
    user="postgres",
    password="siham123"
)
cur = conn.cursor()
cur.execute("DELETE FROM users WHERE email = 'siham@gmail.com'")
cur.execute("""
    INSERT INTO users (id, nom, prenom, email, password_hash, role, is_active)
    VALUES (gen_random_uuid()::text, 'Benali', 'Siham', 'si@gmail.com', %s, 'admin', true)
""", (h,))
conn.commit()
cur.close()
conn.close()
print("Done!")