import 'dotenv/config';
import { env } from './config/env';
import { connectDB } from './config/db';
import app from './app';

async function main() {
  await connectDB();

  const port = parseInt(env.PORT, 10);
  app.listen(port, () => {
    console.log(`🚀 API server running on http://localhost:${port}`);
    console.log(`   Health: http://localhost:${port}/api/v1/health`);
  });
}

main().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
