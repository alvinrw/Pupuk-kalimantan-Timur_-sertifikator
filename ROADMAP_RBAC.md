# Roadmap Keseluruhan: Sistem Login & RBAC (Frontend-First Approach)

**Tech Stack**: React + Vite (Frontend), NestJS (Backend), Prisma (PostgreSQL)

Karena kita menggunakan pendekatan **Frontend-First (UI Dulu)**, urutan kerjanya akan difokuskan untuk menyelesaikan visual dan interaksi (UX) di React terlebih dahulu, lalu disambung dengan pembuatan backend.

---

## 🎨 TAHAP 1: Implementasi Frontend, UI Mock & Pembatasan Akses (Visual)
Fokus tahap ini adalah mensimulasikan sistem Role di React menggunakan *dummy data*.

### 1.1 Setup Mock AuthContext (State Management)
Membuat React Context untuk menyimpan state `user` secara hardcode, agar mempermudah pengetesan UI.

**`frontent/src/contexts/AuthContext.jsx`**
```javascript
import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Ganti role ini manual saat coding: "Super Admin", "Admin", "User", "Viewer"
  const [user, setUser] = useState({
    nama: "Muhfi",
    role: "Super Admin" 
  });

  const login = (username, password) => {
    console.log("Mock Login sukses", username);
  };
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 1.2 Pembuatan `RoleGuard` & Conditional Rendering
Komponen pembungkus untuk menyembunyikan tombol rahasia.

**`frontent/src/components/RoleGuard.jsx`**
```javascript
import { useAuth } from '../contexts/AuthContext';

export const RoleGuard = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) return null; 
  return children;
};
```
*Gunakan `<RoleGuard allowedRoles={['Super Admin', 'User']}> <button>Unggah</button> </RoleGuard>` di halaman Anda.*

### 1.3 UI Halaman Login & "Histori Pencatatan"
- **Login:** Desain halaman login statis.
- **Histori:** Buat tabel dengan *dummy array* berisi Waktu, Nama, Role, Aksi, dan Modul Target.

---

## 🗄️ TAHAP 2: Desain Database & Skema Autentikasi (Backend Foundation)
Fokus tahap ini adalah menyiapkan struktur database yang solid dan membuat sistem login asli (JWT).

### 2.1 Pembuatan Skema Database (`schema.prisma`)
Buka file `Backend/nest-api/prisma/schema.prisma` dan tambahkan model berikut:

```prisma
// Definisi Role Akses
model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique // "Super Admin", "Admin", "User", "Viewer"
  description String?
  users       User[]

  @@map("roles")
}

// Definisi Akun Pengguna
model User {
  id        String   @id @default(uuid())
  nama      String
  npk       String   @unique
  username  String   @unique
  password  String   // Akan disimpan dalam bentuk Hash (Bcrypt)

  roleId    Int      @map("role_id")
  role      Role     @relation(fields: [roleId], references: [id])

  activityLogs ActivityLog[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Histori Pencatatan Aktivitas (Audit Trail)
model ActivityLog {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  action      String   // "INSERT", "UPDATE", "DELETE", "LOGIN"
  targetTable String   @map("target_table") // Nama tabel (contoh: "certificates")
  targetId    String?  @map("target_id")    // ID baris yang diubah
  details     String?  // Data JSON (opsional: old_data & new_data)
  timestamp   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])

  @@map("activity_logs")
}
```
*Jalankan `npx prisma migrate dev --name init_rbac` setelah menambah skema di atas.*

### 2.2 Logika API Register & Login (`auth.service.ts`)
Install dependencies: `npm install @nestjs/jwt @nestjs/passport bcrypt`
```typescript
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  // REGISTER
  async register({ nama, npk, username, password, roleId }) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ npk }, { username }] }
    });
    if (exists) throw new BadRequestException('NPK atau Username sudah terpakai!');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { nama, npk, username, password: hashedPassword, roleId },
    });
  }

  // LOGIN
  async login(username: string, pass: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { username }, include: { role: true } 
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Password salah');

    const payload = { sub: user.id, username: user.username, role: user.role.name, npk: user.npk };
    
    // Pencatatan Log Login
    await this.prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN', targetTable: 'users', targetId: user.id }
    });

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
```

---

## 🔒 TAHAP 3: Middleware Keamanan & Integrasi Sistem (Backend & Frontend)
Fokus tahap ini adalah membatasi endpoint Backend dan mengintegrasikan Frontend (UI) ke Backend.

### 3.1 Pembuatan `RolesGuard` di NestJS
Guard ini membaca token JWT dan mengecek apakah Role user cocok dengan yang diizinkan.
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // Endpoint publik/bebas

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Didapat dari JwtAuthGuard

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(`Akses Ditolak. Membutuhkan role: ${requiredRoles.join(', ')}`);
    }
    return true;
  }
}
```

### 3.2 Hierarki dan Proteksi Role (Super Admin, 2, 3, User, Viewer)
- **Super Admin (Super Admin Mutlak):** Di dalam fungsi `deleteUser()` atau `updateUser()`, tambahkan logika *hardcode* agar user dengan Role "Super Admin" tidak bisa dihapus atau di-edit oleh siapapun.
- **Admin & 3:** Bisa mengakses manajemen user, tetapi diblokir (Forbidden) jika mencoba mengedit Super Admin.
- **User (Standard):** Mendapat akses `@Roles('Super Admin', 'Admin', 'User')` di endpoint Upload/Edit, tapi otomatis ditolak di endpoint `/users` (Manajemen Akun).
- **Viewer (Read-Only):** Dilarang di semua operasi `POST/PUT/DELETE` dan endpoint file/staging (tidak akan lolos `RolesGuard`).

### 3.3 Menyatukan Keduanya (Integrasi)
- Ganti fungsi statis di `AuthContext.jsx` agar memanggil API `POST /auth/login` asli.
- Simpan `access_token` JWT ke `localStorage`.
- Ganti *dummy array* pada Halaman Histori agar menembak API `GET /activity-logs` dari backend.
