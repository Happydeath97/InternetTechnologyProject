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

| Level | Role Name      | Permissions & Capabilities |
| :--- |:---------------| :--- |
| **0** | **Guest**      | **Unauthorized:** Can browse the movie database, view ratings, and read discussion threads. |
| **1** | **User** | **Authenticated:** Can participate in the community by voting on movies and adding comments to discussions. |
| **2** | **Editor**     | **Medium-tier:** Responsible for data quality. Can register new movies and edit metadata (e.g., descriptions) for existing entries. |
| **3** | **Admin**      | **Moderator:** Full CRUD power over movie postings and comments (delete only). Ability to ban problematic users. |
| **4** | **Superadmin** | **System Owner:** Absolute CRUD power over all entities, including the ability to manage admin accounts and system-wide configurations. |

### User Stories (To be extended)
1. **As a [Guest]**, I want to see the main page so that I can access the platform without logging in.
2. **As a [Guest]**, I want to use filters to search for a specific movie so that I can find movies more efficiently.
3. **As a [Guest]**, I want to browse a subset of the movie library so that I can explore available movies.
4. **As a [Guest]**, I want to open a specific movie page so that I can see its details.
5. **As a [Guest]**, I want to read comments and ratings for a movie so that I can understand other users’ opinions.
6. **As a [Guest]**, I want to register an account so that I can participate in the platform.
7. **As a [Guest]**, I want to flag a movie post for incorrect information so that editors or admins can review it.
8. **As a [Guest]**, I want to report vulgar or inappropriate comments so that the discussion stays respectful.

9. **As a [User]**, I want to log in so that I can access authenticated features.
10. **As a [User]**, I want to log out so that I can securely end my session.
11. **As a [User]**, I want to rate and comment on a specific movie so that I can share my opinion with others.
12. **As a [User]**, I want to edit my own comments so that I can correct or improve them later.
13. **As a [User]**, I want to delete my own comments so that I can remove content I no longer want to share.
14. **As a [User]**, I want to edit my account details so that I can keep my profile information up to date.
15. **As a [User]**, I want to use all guest features so that registration does not limit my browsing experience.

16. **As an [Editor]**, I want to use all user features so that I can also participate in the platform as a normal user.
17. **As an [Editor]**, I want to create a new movie record so that new movies can be added to the library.
18. **As an [Editor]**, I want to edit an existing movie record so that incorrect or incomplete information can be fixed.

19. **As an [Admin]**, I want to use all editor features so that I can manage both content and community moderation.
20. **As an [Admin]**, I want to create, read, update, and delete movie records so that I can fully maintain the movie database.
21. **As an [Admin]**, I want to delete inappropriate user comments so that I can enforce community standards.
22. **As an [Admin]**, I want to ban problematic users so that I can protect the platform from abuse.

23. **As a [Superadmin]**, I want to use all admin features so that I have full platform control.
24. **As a [Superadmin]**, I want full CRUD access over all entities so that I can manage the entire system.
25. **As a [Superadmin]**, I want to access the admin view so that I can supervise and configure the platform at the highest level.

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
