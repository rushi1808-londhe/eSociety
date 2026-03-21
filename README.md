# eSociety — Residential Society Management System

A full-stack web application to digitize and streamline the complete management of residential societies. Built with Spring Boot and React JS.

for demo video : https://drive.google.com/file/d/1umFIUQmjl-7bFUAZ6e45BaUKqinZk0eK/view?usp=sharing

---

## 🏠 About The Project

eSociety solves the problem of manual society management — paper-based maintenance collection, notice boards, and complaint registers — by providing a digital platform for Super Admins, Admins, and Residents.

---

## ✨ Features

### Super Admin
- Manage multiple societies and assign admins
- Toggle society/admin status (deactivating society auto-deactivates its admins)
- Search and filter across all data

### Admin
- Manage Buildings, Flats and Parking slots
- Manage Residents and assign them to vacant flats
- Set Maintenance Rates per flat type (1BHK, 2BHK, 3BHK)
- Auto-generate monthly maintenance bills
- Update complaint status (Open → In Progress → Closed)
- Post and manage notices for residents

### Resident
- Dashboard with flat info, bill summary and latest notices
- View and pay maintenance bills
- Raise and track complaints
- View all active notices

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Spring Boot 3 | REST API framework |
| Spring Security + JWT | Authentication & Authorization |
| Spring Data JPA | ORM / Database layer |
| MySQL | Relational database |
| Lombok | Reduce boilerplate code |

### Frontend
| Technology | Purpose |
|---|---|
| React JS | UI framework |
| React Router DOM | Client-side routing |
| Bootstrap 5 + Bootstrap Icons | UI & styling |
| React Hook Form | Form handling & validation |
| React Toastify | Toast notifications |

---


## ⚙️ Setup & Installation

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+
- Maven

### Backend Setup

```bash
git clone https://github.com/yourusername/esociety.git
cd esociety/esociety-backend
```

Create MySQL database:
```sql
CREATE DATABASE esociety;
```

Configure `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/esociety
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

Run:
```bash
mvn spring-boot:run
```
Backend runs on `http://localhost:8080`

### Frontend Setup

```bash
cd esociety/esociety-frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

---

## 🔐 Security

JWT token based authentication. Spring Security protects all endpoints by role — Super Admin, Admin and Resident each have access only to their own APIs.

---

## 🚀 Future Enhancements

- Payment gateway integration
- Email notifications for bills and notices
- Dashboard charts and graphs
- Mobile app

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: youremail@gmail.com

---

⭐ If you found this project helpful, please give it a star!
