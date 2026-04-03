# HelpDesk System Backend

RESTful API for a help desk ticketing platform with role-based access control for **Administrators**, **Technicians**, and **Clients**.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Backend | Node.js, AdonisJS 4.1.0 |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| File Storage | Cloudinary |
| Deployment | Render |

---

## Features

- User authentication and registration with JWT tokens
- Role-based access control (Admin, Technician, Client)
- Ticket management system with status tracking
- Service catalog with pricing
- Additional services can be added to tickets
- Client profile management with photo upload
- Technician profile management with photo upload
- Admin endpoints for managing clients, technicians, and services
- Ticket assignment to technicians
- Ticket filtering by role (clients see their tickets, technicians see assigned tickets)
- Password change functionality for all users
- Admin can reset user passwords
- Image upload and management via Cloudinary
- Role-based middleware for route protection
- CORS configuration for cross-origin requests

---

## Project Structure

```
backend/
├── app/
│   ├── Controllers/Http/
│   │   ├── AuthController.js
│   │   ├── ChamadoController.js
│   │   ├── ClienteController.js
│   │   ├── TecnicoController.js
│   │   ├── ServicoController.js
│   │   └── UserController.js
│   ├── Middleware/
│   │   ├── CheckRole.js
│   │   └── ConvertEmptyStringsToNull.js
│   ├── Models/
│   │   ├── User.js
│   │   ├── Cliente.js
│   │   ├── Tecnico.js
│   │   ├── Chamado.js
│   │   ├── Servico.js
│   │   ├── Adicional.js
│   │   └── Token.js
│   └── Services/
│       ├── CloudinaryService.js
│       └── ProfileIdentityService.js
├── config/
│   ├── app.js
│   ├── auth.js
│   ├── cors.js
│   ├── database.js
│   └── shield.js
├── database/
│   ├── migrations/
│   └── seeds/
├── start/
│   ├── app.js
│   ├── kernel.js
│   └── routes.js
├── public/
│   └── uploads/
├── package.json
├── server.js
└── render.yaml
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Create environment file and start production server |
| `npm run serve` | Start development server with hot reload |
| `npm run prod` | Start production server |
| `npm test` | Run backend tests |

---

## Future Improvements

- Real-time notifications for ticket updates using WebSockets
- Email notifications for ticket status changes
- Ticket priority levels (low, medium, high, urgent)
- Ticket comments and activity history
- File attachments for tickets
- Advanced search and filter functionality
- Dashboard analytics and reporting endpoints
- Service level agreements (SLA) tracking
- Rate limiting for API endpoints
- API documentation with Swagger/OpenAPI
- Automated ticket assignment based on technician workload
- Audit logs for admin actions
- Bulk operations for tickets and users

---

## Author

**Alcino Luvualo** | Full Stack Developer  
[LinkedIn](https://linkedin.com/in/alcino-luvualo) | [GitHub](https://github.com/alcinoluvualo)
