import pg from "pg";

const pool = new pg.Pool({
  host: "127.0.0.1",
  database: "localprint",
  user: "localprint",
  password: "localprint123",
});

export default pool;
