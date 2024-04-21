import * as dotenv from 'dotenv';

dotenv.config();

const ENV_VAR = {
  PORT: process.env.PORT,
};

export default ENV_VAR;
