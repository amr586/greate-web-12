# Project Notes

## Overview
- React + Vite real estate application with an Express/TypeScript backend.

## Recent Changes
- Migrated the imported project to run on Replit with separate frontend and backend workflows.
- Installed Node dependencies, configured Vite for the Replit preview, and verified frontend/API health through the Replit domain.
- Added PostgreSQL support to the backend database wrapper while preserving MySQL support for existing external deployments.
- Added a development-only ephemeral JWT secret fallback so local Replit development can start without hardcoded secrets; production still requires `JWT_SECRET`.
- Initialized the Replit PostgreSQL database using the project's existing setup script.
- Fixed property detail pages so property chat updates scroll only inside the chat box instead of moving the whole page downward automatically.
- Added a bottom-of-page recommended property section on property detail pages, selecting a different available property with preference for featured/similar listings.
- Implemented private per-user property chat filtering, branded admin replies as Great Society Team, Cairo-only district choices, staff property-edit permission fixes, and database seed updates for the requested Great Society staff accounts and featured Cairo properties.