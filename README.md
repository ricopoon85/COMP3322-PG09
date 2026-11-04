# COMP3322-PG09

## Local setup

1. Create the MySQL database with `database/schema.sql`.
2. Copy `backend/.env.example` to `backend/.env` and set the local MySQL
   password and a long random `JWT_SECRET`.
3. Install and start the backend:

```text
cd backend
npm install
npm start
```

4. Install and start the frontend in another terminal:

```text
cd frontend
npm install
npm run dev
```

The backend serves the API at `http://localhost:3000/api`, including the
database-backed health check at `/api/health`.

---

## Deployment

Our application is deployed on the group's server using Docker Compose with Option B (HTTP on port 80).

### Access URL

You can access the live application while connected to HKUVPN at:
[http://c3322-pg09.cs.hku.hk](http://c3322-pg09.cs.hku.hk)
