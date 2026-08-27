import mysql from 'mysql2/promise';

let pool = null;
let lastError = null;

const required = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];

const getMissingVars = () => required.filter((key) => !process.env[key]);

export const connectToDatabase = async () => {
  const missing = getMissingVars();
  if (missing.length > 0) {
    lastError = `Missing required MySQL environment variables: ${missing.join(', ')}`;
    throw new Error(lastError);
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }

  try {
    await pool.query('SELECT 1');
    lastError = null;
    return pool;
  } catch (error) {
    lastError = error instanceof Error ? error.message : 'MySQL connection failed';
    throw error;
  }
};

export const getDatabaseStatus = () => ({
  connected: !lastError && !!pool,
  type: 'mysql',
  host: process.env.MYSQL_HOST || null,
  port: Number(process.env.MYSQL_PORT || 3306),
  name: process.env.MYSQL_DATABASE || null,
  lastError,
});
