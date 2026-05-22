# Relay Admin Panel

Admin panel for managing Relay devices, users, and fault reports.

## Features

- **User Management**
  - Create, edit, and delete users
  - Role-based access control (Admin, Service Technician, Installer, User)
  - Password reset functionality for admins
  - View user-assigned devices and fault reports

- **Device Management**
  - View and manage all devices
  - Generate QR codes for device registration
  - Assign devices to users
  - Track device status and location

- **Fault Reporting**
  - View and manage fault reports
  - Assign technicians to faults
  - Track fault status (New, In Progress, Resolved)
  - Anonymous fault reporting via QR codes

- **Dashboard**
  - Overview statistics
  - Recent activity
  - Device categories breakdown
  - Performance metrics

## User Roles

- **Administrator** - Full access to all features
- **Service Technician** - Can view and manage assigned faults
- **Installer** - Can manage installation tasks
- **User** - Limited access to own devices

## Tech Stack

- **Frontend**: Vue 3 with Composition API and TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: TailwindCSS
- **Testing**: Vitest + Vue Test Utils
- **Build Tool**: Vite
- **Deployment**: Vercel

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build for Production

```sh
npm run build
```

### Run Tests

```sh
npm run test
```

### Test UI

```sh
npm run test:ui
```

### Linting

```sh
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=https://your-api-url.com
```

## Deployment

The application is deployed on Vercel with SPA routing support configured in `vercel.json`.

## API Integration

The frontend integrates with the Relay API backend. Ensure CORS is configured on the backend to allow requests from the Vercel domain.

Required API endpoints:
- `GET /api/users` - List users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users` - Create user (to be implemented in backend)
- `PATCH /api/users/{id}/password` - Reset user password (to be implemented in backend)
- `GET /api/devices` - List devices
- `POST /api/devices` - Create device
- `PUT /api/devices/{uuid}` - Update device
- `DELETE /api/devices/{uuid}` - Delete device
- `GET /api/faults` - List faults
- `PATCH /api/faults/{id}` - Update fault status

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)
