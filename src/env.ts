import dotenv from 'dotenv';
import TrustEnv from 'trust-env';

dotenv.config();

export default TrustEnv([
  { key: 'SERVER_PORT', type: 'integer' },
  { key: 'POSTGRESQL_HOST', type: 'string' },
  { key: 'POSTGRESQL_PORT', type: 'integer' },
  { key: 'POSTGRESQL_USER', type: 'string' },
  { key: 'POSTGRESQL_PASSWORD', type: 'string' },
  { key: 'POSTGRESQL_DATABASE', type: 'string' },
]);
