from configs.config import JWT_SECRET
import jwt
print("JWT_SECRET:", repr(JWT_SECRET), type(JWT_SECRET))
try:
    tok = jwt.encode({"ping": "pong"}, JWT_SECRET, algorithm="HS256")
    print("JWT encode OK, token length:", len(tok))
except Exception as e:
    print("JWT encode ERROR:", repr(e))
