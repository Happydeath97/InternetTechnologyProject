# MoviePulse: Tiered Movie Rating & Discussion Platform

MoviePulse is a centralized web application for movie enthusiasts to discover, rate, and discuss films.
The platform is implemented as a database-driven web application using Django and follows a layered architecture
with role-based access control ranging from guests to superadmins.

[![License](https://img.shields.io/badge/license-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

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
| :---: | :------------- | :--- |
| **0** | **Guest**      | **Unauthorized:** Can access the main page, browse a public subset of the movie library, use filters, open movie detail pages, read ratings and comments, register an account, and report incorrect movie information or inappropriate comments. |
| **1** | **User**       | **Authenticated:** Includes all Guest permissions. Can log in and log out, rate movies, add comments, edit or delete own comments, and update account details. Limited to one rating per movie. |
| **2** | **Editor**     | **Content Curator:** Includes all User permissions. Can create new movie records, edit existing movie records, and review reported movie information to maintain data quality. |
| **3** | **Admin**      | **Moderator:** Includes all Editor permissions. Can delete inappropriate comments, review reported comments, ban users, and manage movie records with full CRUD functionality when necessary. |
| **4** | **Superadmin** | **System Owner:** Includes all Admin permissions. Has full CRUD authority over all entities, can manage privileged accounts and permissions, and can access protected administrative views and system-level controls. |

### User Stories (To be extended)
1. **As a [Guest]**, I want to access the main page without logging in so that I can immediately use the platform.
2. **As a [Guest]**, I want to browse a public list of movies so that I can discover available content.
3. **As a [Guest]**, I want to filter movies by attributes such as title, genre, or year so that I can find specific movies more efficiently.
4. **As a [Guest]**, I want to open a movie detail page so that I can view detailed information about a selected movie.
5. **As a [Guest]**, I want to see ratings and comments for a movie so that I can understand community opinions before deciding to watch it.
6. **As a [Guest]**, I want to register an account so that I can participate in rating and discussion features.
7. **As a [Guest]**, I want to report incorrect movie information so that editors or admins can review possible errors.
8. **As a [Guest]**, I want to report vulgar or inappropriate comments so that the platform remains respectful and useful.
9. **As a [Guest]**, I want to use the application on desktop and mobile devices so that I can access it comfortably from different devices.

10. **As a [User]**, I want to log in securely so that I can access authenticated features.
11. **As a [User]**, I want to log out so that I can safely end my session on a shared or personal device.
12. **As a [User]**, I want to rate a movie so that I can express my opinion numerically.
13. **As a [User]**, I want to comment on a movie so that I can share my thoughts with other users.
14. **As a [User]**, I want to edit my own comments so that I can correct mistakes or improve my contribution.
15. **As a [User]**, I want to delete my own comments so that I can remove content I no longer want to publish.
16. **As a [User]**, I want to edit my account details so that my profile information stays current.
17. **As a [User]**, I want the system to allow only one rating per movie per account so that ratings remain fair and consistent.

18. **As an [Editor]**, I want to create new movie records so that newly released or missing movies can be added to the platform.
19. **As an [Editor]**, I want to edit existing movie records so that wrong or incomplete movie information can be corrected.
20. **As an [Editor]**, I want to review reported movie entries so that flagged content can be checked and improved.

21. **As an [Admin]**, I want to delete inappropriate comments so that community rules can be enforced.
22. **As an [Admin]**, I want to review reported comments so that harmful or vulgar discussion content can be moderated.
23. **As an [Admin]**, I want to ban users who repeatedly violate platform rules so that abuse of the system is reduced.
24. **As an [Admin]**, I want to manage movie records with full CRUD functionality so that I can maintain content quality when needed.

25. **As a [Superadmin]**, I want to manage all system entities so that I have full control over the platform.
26. **As a [Superadmin]**, I want to manage privileged accounts and permissions so that the authorization hierarchy remains secure and correct.
27. **As a [Superadmin]**, I want to access a protected admin view so that I can supervise platform data and administration functions.
28. **As a [Superadmin]**, I want the system to enforce role hierarchy rules so that lower-level users cannot perform actions above their authority.

### Use Cases
The following use cases define the core functional requirements of the MoviePulse platform:

* **UC-1 [Browse Movies]:** Allows guests to access the main page, browse a public subset of the movie library, use filters to search for specific movies, open movie detail pages, and read ratings and comments without logging in.
* **UC-2 [Account Management]:** Enables guests to register accounts and allows authenticated users to log in, log out, and edit their account details.
* **UC-3 [Rate and Comment]:** Enables authenticated users to submit one rating per movie, add comments to movies, edit their own comments, and delete their own comments.
* **UC-4 [Report Content]:** Allows guests and users to report incorrect movie information and flag vulgar or inappropriate comments for review.
* **UC-5 [Movie Curation]:** Provides editors with the ability to create new movie records, edit existing movie records, and review flagged movie entries to maintain content quality.
* **UC-6 [Community Moderation]:** Empowers admins to review reported comments, delete inappropriate comments, manage user bans, and maintain movie records with full CRUD functionality where necessary.
* **UC-7 [System Administration]:** Grants superadmins full CRUD authority over all system entities, including privileged account and permission management, as well as access to the protected admin view.
---

## Design

### Domain Design

The MoviePulse platform is centered around several core domain entities that reflect the functional requirements, user roles, moderation workflows, and technical architecture of the system. The domain design serves as the conceptual foundation for the later ER/EER model and database schema.

For authentication and authorization, the system will rely on Django’s built-in user model and permission framework. Platform-specific user data will be stored in a related profile entity, while role-based access will be represented through a role attribute and synchronized Django permission groups.

* **User** (`id`, `username`, `email`, `password`, `is_active`, `is_staff`, `is_superuser`, `date_joined`, `last_login`)  
  Represents the built-in Django authentication entity used for login, logout, and access control. It stores the core credentials and authentication-related data of registered users. Guests are not stored as persistent records and are treated as unauthorized visitors.

* **UserProfile** (`profile_id`, `user_id`, `role`, `status`, `created_at`, `updated_at`)  
  Stores application-specific user information that extends the built-in Django user model. It contains the role of the user within the platform (User, Editor, Admin, Superadmin) and can later be extended with additional profile-related data if needed.

* **Movie** (`movie_id`, `title`, `description`, `release_year`, `genre`, `director`, `created_at`, `updated_at`, `created_by`)  
  Represents a movie entry in the platform. It stores the main metadata for each movie and acts as the central entity around which ratings, comments, and reports are organized.

* **Rating** (`rating_id`, `user_id`, `movie_id`, `score`, `created_at`, `updated_at`)  
  Links users to movies through a numeric score. This entity supports the business rule that one registered user may submit only one rating per movie.

* **Comment** (`comment_id`, `user_id`, `movie_id`, `content`, `created_at`, `updated_at`, `status`)  
  Stores text-based discussion entries written by users for specific movies. Comments may later be edited by their authors and reviewed or deleted by administrators if they violate platform rules.

* **Report** (`report_id`, `reporter_id`, `target_type`, `target_id`, `reason`, `description`, `status`, `reviewed_by`, `created_at`, `reviewed_at`)  
  Represents reports submitted to flag incorrect movie information or vulgar/inappropriate comments. This entity supports the moderation and review workflow of the platform.

* **Ban** (`ban_id`, `user_id`, `admin_id`, `reason`, `start_date`, `end_date`, `is_permanent`, `status`)  
  Stores administrative bans imposed on users who repeatedly violate platform rules. For permanent bans, `end_date` may remain empty. This entity supports traceable moderation decisions and restriction handling.

* **Group / Permission Mapping**  
  At the application level, Django groups will represent permission bundles such as Editor, Admin, and Superadmin. These groups are linked to Django’s permission system and will be assigned automatically based on the role stored in the `UserProfile` entity. This ensures consistency between the business role of a user and the effective permissions granted by the framework.

#### Main Relationships
* One **User** has exactly one **UserProfile**.
* One **User** can create many **Ratings**.
* One **User** can create many **Comments**.
* One **User** can create many **Reports**.
* One **Movie** can have many **Ratings**.
* One **Movie** can have many **Comments**.
* One **Movie** can be referenced by many **Reports**.
* One **Comment** can be referenced by many **Reports**.
* One **Admin** can review many **Reports**.
* One **Admin** can issue many **Bans**.
* One **User** can receive zero or many **Bans**.
* One **UserProfile** role maps to one corresponding Django permission group.

#### Business Rules Reflected in the Domain
* A registered user may submit only **one rating per movie**.
* Guests may browse and report content, but only registered users may rate and comment.
* Editors may create and update movie data.
* Admins may moderate comments, review reports, and ban users.
* Superadmins have full authority over all entities and privileged permissions.
* A permanent ban has `is_permanent = true` and no required `end_date`.
* User permissions must remain consistent with the assigned platform role.
---

## Implementation

### Backend Technology
The backend is implemented using a Python-based web framework:
- **Django** for the core backend architecture, routing, views, templates, authentication, and administrative functionality.
- **Django ORM** for object-relational mapping and database interaction.
- **SQLite** for development and demonstration purposes, with the option to switch to another relational database later if needed.
- **Django Authentication and Authorization System** for login, user groups, and permission management.
- **Django Admin** for internal administrative and moderation functionality.

### Frontend Technology
This application uses a server-rendered web frontend with lightweight client-side enhancements:
- **HTML, CSS, and JavaScript** for the user interface and interactive behavior.
- **Django Templates** for dynamic rendering of pages such as movie lists, detail views, forms, and account-related screens.
- **Responsive Design Principles** to support both desktop and mobile usage.
- **Form-based interaction:** The frontend communicates with the backend primarily through Django views, forms, and rendered templates.
---

## Project Management

### Roles 
- **Backend Developer:** Vávra Kryštof (Spring Boot architecture, Security, SQL Integration).
- **Frontend Developer:** Vávra Kryštof (UI/UX Design, Vanilla JS, Budibase views).
- **Project Lead:** Vávra Kryštof (Documentation, API Design, Milestone tracking).

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

#### License
- [BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause)
