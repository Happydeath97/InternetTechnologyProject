# MoviePulse: Tiered Movie Rating & Discussion Platform

MoviePulse is a centralized web application for movie enthusiasts to discover, rate, and discuss films.
This project follows a 3-tier architecture and implements a sophisticated permission system ranging 
from public viewers to "Superadmins".

[![License](https://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

#### Contents:
- [Analysis](#analysis)
    - [Scenario](#scenario)
    - [User Stories](#user-stories)
    - [Use Case](#use-case)
- [Design](#design)
    - [Domain Design](#domain-design)
    - [Business Logic](#business-logic)
- [Implementation](#implementation)
    - [Backend Technology](#backend-technology)
    - [Frontend Technology](#frontend-technology)
- [Project Management](#project-management)
    - [Roles](#roles)
    - [Milestones](#milestones)

---

## Analysis

### Scenario
MoviePulse is a movie database application that allows users to interact with film data based on 
their authorization level. While public users can browse content, authenticated users contribute to the 
community via ratings and comments. Higher-tier roles (Editors and Admins) ensure 
data quality by managing metadata and moderating discussions.

### User Levels

| Level | Role Name | Permissions & Capabilities |
| :--- | :--- | :--- |
| **0** | **Public User** | **Unauthorized:** Can browse the movie database, view ratings, and read discussion threads. |
| **1** | **Basic User** | **Authenticated:** Can participate in the community by voting on movies and adding comments to discussions. |
| **2** | **Editor** | **Medium-tier:** Responsible for data quality. Can register new movies and edit metadata (e.g., descriptions) for existing entries. |
| **3** | **Admin** | **Moderator:** Full CRUD power over movie postings and comments (delete only). Ability to ban problematic users. |
| **4** | **Superadmin** | **System Owner:** Absolute CRUD power over all entities, including the ability to manage admin accounts and system-wide configurations. |

### User Stories (To be extended)
1. **As an [Admin]**, I want to have a Web app so that I can use it on different mobile devices and on desktop computers.
2. **As an [Admin]**, I want to see a consistent visual appearance so that I can navigate easily.
3. **As an [Admin]**, I want to use list views so that I can explore and read my business data.
4. **As an [Admin]**, I want to use edit and create views so that I can maintain my business data.
5. **As an [Admin]**, I want to log-in so that I can authenticate myself.
6. **As a [User]**, I want to use list views so that I can access public pages.
7. **As a [User]**, I want to authenticate myself so that I can read my personal and confidential data.

### Use Case
The following use cases define the core functional requirements of the MoviePulse platform:

* **UC-1 [Public Browse]:** Allows unauthorized users to access the movie catalog and view existing discussion threads without logging in.
* **UC-2 [Rate & Comment]:** Enables authenticated Basic Users to interact with content by submitting numeric ratings and text comments.
* **UC-3 [Curate Data]:** Provides Editors with the tools to register new movie entries and update metadata to maintain database accuracy.
* **UC-4 [Moderation]:** Empowers Admins to maintain community standards by deleting comments and managing user bans.
* **UC-5 [System Administration]:** Grants Superadmins full CRUD (Create, Read, Update, Delete) authority over the entire system, including user and admin account management.
---

## Design

### Domain Design (To be implemented)

The `itassignment.internettechnologyproject.data.domain` package contains the following four entities, meeting the minimum project requirements:

* **User:** Stores credentials and role-based access levels (Public, Basic, Editor, Admin, Superadmin).
* **Movie:** Contains film metadata such as Title, Description, Year, and Genre.
* **Rating:** Links Users to Movies with a numeric score to ensure data integrity and track community sentiment.
* **Comment:** Stores text-based discussion data associated with specific films and users.

### Business Logic
The service layer implements the following enterprise business rules to ensure data integrity:
- **Uniqueness Rule:** The system prevents duplicate movie entries by checking the Title and Release Year.
- **Integrity Rule:** A user is restricted to one rating per movie.
- **Hierarchy Rule:** Users can only manage accounts or content within their designated permission tier.

---

## Implementation

### Backend Technology
The backend is implemented using an enterprise-grade framework:
- **Spring Boot 3.0** & **Java 17**.
- **Spring Data JPA** for Object-Relational Mapping (ORM).
- **H2 Database** for in-memory demonstration purposes.
- **OpenAPI 3.0 (Swagger)** for API endpoint documentation.
- **Basic Authentication** for API-level security.

### Frontend Technology
This application utilizes a **hybrid approach** for the presentation layer:
- **HTML, CSS, and Vanilla JavaScript** for core movie interaction and custom discussion logic to ensure a tailored User Experience (UX).
- **Budibase** for rapid prototyping of administrative list views and internal data management screens.
- **RESTful API:** The frontend communicates with the backend via a standardized REST architecture.

---

## Project Management

### Roles 
- **Backend Developer:** Vávra Kryštof; ??? (Spring Boot architecture, Security, SQL Integration).
- **Frontend Developer:** Vávra Kryštof; ??? (UI/UX Design, Vanilla JS, Budibase views).
- **Project Lead:** Vávra Kryštof; ??? (Documentation, API Design, Milestone tracking).

### Milestones
- [x] **1. Decide use case; Team finalized:** Initial scenario ideation.
- [x] **2. Create project description in Readme:** Analysis and user story definition.
- [ ] **3. Draft API list:** Definition of endpoints in Swagger.
- [ ] **4. Initial backend setup:** Spring Boot 3.0 project initialization.
- [ ] **5. First Web services implemented:** CRUD operations for Movie entity.
- [ ] **6. Web services implemented:** Rating and Comment logic completion.
- [ ] **7. Enable Basic Authentication:** Securing API endpoints.
- [ ] **8. Decide Front-end Strategy:** Finalizing hybrid JS/Low-code approach.
- [ ] **9. Front-end Implementation:** Prototyping and realizing UI functionality.
- [ ] **10. Front-end integrated:** Connecting UI to REST APIs.
- [ ] **11. Project Submission:** 14.06.2026.

#### Maintainer
- Vávra Kryštof
- Marti Asia
- Lantos Marc
- Honegger Nils

#### License
- [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
