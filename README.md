# BIFROST - Network Route Calculator

BIFROST is a Next.js application for calculating optimal network routes through data center infrastructure. It models buildings, rooms, racks, and connections to find the shortest path between two locations using Dijkstra's algorithm.

## Features

- **Route Calculation**: Find shortest path between two system IDs
- **Redundancy Support**: Calculate redundant paths without shared connections
- **Topology Management**: Upload and manage infrastructure via Excel/CSV
- **Admin Dashboard**: Secure admin area for topology uploads
- **Docker Ready**: Full containerized deployment with PostgreSQL

## System Architecture

### Data Model

- **Buildings**: IBX codes (e.g., FR2, MU1) representing data center locations
- **Rooms**: Individual rooms within buildings
  - `NORMAL`: Customer cages/modules with racks
  - `BACKBONE`: Meet-Me rooms, carrier zones, NSE areas
- **Connections**: Rack-to-rack links with distance
  - Within room = patch panel connections
  - Cross-room = segment/fiber connections

### System ID Format

System IDs follow the pattern: `IBX:FLOOR:ROOM[:CUSTOMER]`

Examples:
- `FR2:01:50900` - Building FR2, Floor 01, Room 50900
- `FR2:01:MMR-01` - Meet-Me Room in FR2
- `MU1:UG:NSE-01` - Network Service Edge room (underground floor)
- `FR2:01:50900:Vodafone` - Customer-specific system ID

## Quick Start with Portainer

### Prerequisites

- Portainer installed and running
- PostgreSQL port 5432 available
- Application port 4020 available

### Deployment Steps

1. **Create Stack in Portainer**
   - Navigate to Stacks → Add Stack
   - Name: `bifrost`
   - Build method: **Repository**
   - Repository URL: `https://github.com/YOUR-USERNAME/bifrost`
   - Repository reference: `main`

2. **Deploy Stack**
   - Click "Deploy the stack"
   - Portainer will automatically:
     - Clone the repository
     - Build the Docker image
     - Start PostgreSQL database
     - Run Prisma migrations
     - Start the Next.js application

3. **Access Application**
   - Homepage: `http://localhost:4020`
   - Admin Panel: `http://localhost:4020/admin`
   - Default credentials: `admin` / `admin`

### Environment Variables (Configured in docker-compose.yml)

```yaml
DATABASE_URL: postgresql://bifrost:bifrost_password@postgres:5432/bifrost
ADMIN_USERNAME: admin
ADMIN_PASSWORD: admin
```

**⚠️ Security Warning**: Change the default credentials before production deployment!

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16
- npm or yarn

### Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/bifrost.git
   cd bifrost
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create `.env` file:
   ```env
   DATABASE_URL="postgresql://bifrost:bifrost_password@localhost:5432/bifrost"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="admin"
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Application runs at `http://localhost:3000`

## Usage

### Route Calculation

1. Navigate to homepage
2. Enter start system ID (e.g., `FR2:01:50900`)
3. Enter end system ID (e.g., `MU1:01:60100`)
4. Select redundancy option:
   - **Single Path**: One shortest route
   - **Redundant Path**: Two non-overlapping routes
5. Click "Calculate Route"

### Topology Upload (Admin)

1. Navigate to `/admin`
2. Login with credentials (default: admin/admin)
3. Prepare Excel file with three sheets:
   - **Buildings**: `ibxCode`, `name`, `city`, `country`
   - **Rooms**: `systemId`, `buildingIbx`, `floor`, `roomName`, `type`
   - **Connections**: `fromSystemId`, `toSystemId`, `lengthMeters`, `rackInfo`
4. Upload file
5. Review import results

### Sample Data

Sample CSV files are provided in `sample-data/`:
- `buildings.csv`: Sample buildings (FR2, MU1)
- `rooms.csv`: Sample rooms (5 rooms total)
- `connections.csv`: Sample connections (4 links)

## Technology Stack

- **Frontend**: React 19.2.3, Next.js 16.1.6, Tailwind CSS v4
- **Backend**: Next.js App Router API routes
- **Database**: PostgreSQL 16 with Prisma ORM 6.1.0
- **Authentication**: Cookie-based session (bcryptjs)
- **File Parsing**: xlsx library
- **Containerization**: Docker with multi-stage builds

## API Endpoints

### Public Routes

- `POST /api/topology` - Calculate route
  ```json
  {
    "start": "FR2:01:50900",
    "end": "MU1:01:60100",
    "redundancy": "redundant"
  }
  ```

- `GET /api/buildings` - List all buildings
- `GET /api/rooms` - List all rooms
- `GET /api/connections` - List all connections

### Admin Routes (Require Authentication)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/check` - Check authentication status
- `POST /api/topology/upload` - Upload topology Excel file

## Database Schema

### Building
- `id`: Integer (PK)
- `ibxCode`: String (Unique)
- `name`: String
- `city`: String
- `country`: String

### Room
- `id`: Integer (PK)
- `systemId`: String (Unique)
- `buildingId`: Integer (FK → Building)
- `floor`: String
- `roomName`: String
- `type`: Enum (NORMAL, BACKBONE)

### Connection
- `id`: Integer (PK)
- `fromRoomId`: Integer (FK → Room)
- `toRoomId`: Integer (FK → Room)
- `lengthMeters`: Float
- `rackInfo`: String (Optional)

## Portainer Deployment Details

The project is optimized for Portainer Stack deployment:

### docker-compose.yml Structure

- **PostgreSQL Service**:
  - Image: `postgres:16-alpine`
  - Health check configured
  - Data persisted in Docker volume

- **App Service**:
  - Built from Dockerfile
  - Depends on postgres health check
  - Runs migrations on startup
  - Exposes port 4020

### Dockerfile Details

- **Stage 1: Builder**
  - Install all dependencies
  - Generate Prisma client
  - Build Next.js production bundle

- **Stage 2: Runtime**
  - Copy production files
  - Run `prisma migrate deploy --skip-generate`
  - Start Next.js server

### Health Checks

- PostgreSQL: `pg_isready -U bifrost`
- Application: Accessible via port 4020

## Troubleshooting

### Container Issues

1. **Database connection failed**
   - Verify postgres container is running: `docker ps`
   - Check logs: `docker logs bifrost-postgres-1`

2. **Migration errors**
   - Ensure DATABASE_URL is correct
   - Check Prisma schema syntax
   - View app logs: `docker logs bifrost-app-1`

3. **Port conflicts**
   - Change port mapping in docker-compose.yml
   - Default: `4020:3000` for app, `5432:5432` for postgres

### Deployment Issues

1. **Portainer build fails**
   - Verify GitHub URL is correct
   - Check repository is public or credentials are provided
   - Review Portainer build logs

2. **Application won't start**
   - Check environment variables in docker-compose.yml
   - Verify all dependencies are installed (no `--omit=optional`)
   - Increase container memory if needed

## Security Considerations

⚠️ **Important**: This configuration uses hardcoded credentials for test environments only.

**Before Production**:
1. Change `ADMIN_PASSWORD` to a strong password
2. Change `DATABASE_URL` password
3. Enable HTTPS
4. Use environment-specific secrets
5. Implement rate limiting
6. Add proper session management
7. Enable CORS restrictions

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please open an issue on GitHub.
