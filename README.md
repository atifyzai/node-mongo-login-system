# node-mongo-login-system

Make .env file in the root directory and paste the following code:

DB = "mongodb://localhost/login_db"
HOST = "smtp.gmail.com"
USER = Your Email
PASS = Your Password
SERVICE = "gmail"
BASE_URL = "http://localhost:8080/api"

CLIENT_ID= 827158147741-j4jjr515pvs86hbiahjhjdgvcasnsluc.apps.googleusercontent.com
CLIENT_SECRET= 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
CALLBACK_URL= http://localhost:8080/auth/google/callback

Commands:

npm install

node server.js

This will connect with mongo db.
