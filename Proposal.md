# Web Note Hub - COMP3322 PG09 Project Proposal


---

## 1. Member Information & Preliminary Task Allocation

| Name | UID | Tasks |
| :--- | :--- | :--- |
| **Poon Wing Lok** | 3036239267 | Database schema design, proposal writing |
| **Tam Ho Chun** | 3036218342 | Backend API development & integration |
| **Lo Kwok Ming** | 3036067004 | Backend API development & integration |
| **Lam Cheung Lam** | 3036220498 | Frontend development & UI design |
| **Lin Chuen Ching** | 3035922996 | Frontend development & UI design, proposal writing |
| |
| **All members** | | Documentation, testing, version control, deployment, presentation |

---


## 2. Project Description

Our group's lightweight web application aims to allow users, especially students and professionals, to create and manage all their notes in one place.
Users may also collaborate on notes with each other by using the app's sharing function.

---

## 3. Problem & Target User Context

### 3.1 Real-Life Problems

* Heavy note-takers, such as students and professionals, often struggle to manage scattered notes across all kinds of media, from paper to tablets.
  This leads to wasted time searching and a high risk of information loss.
* They also need to handle collaborative tasks, raising the demand for an accessible way to share instructions and important information with colleagues.

### 3.2 Target Users & Web-based Benefits

* Students: Organize class schedules, lecture highlights, and even handwritten notes in one place.
  - Benefit: No more wasting time searching across apps/devices or transferring files manually.
* Professionals: Use shared notes as a space where project team members can easily retrieve / add insights and resources.
  - Benefit: Smoother collaboration flow and enhanced productivity.
* Casual users: Store everyday notes, like shopping lists and phone memos, in one simple hub without needing large storage.
  - Benefit: Since web apps require minimal hardware/software resources, even low-performance devices can run our app smoothly.

---

## 4. Feature List

### 4.1 Must-have Features

Non-negotiable core features your project must complete

* **Login system**: Users must login to see their stored notes.
* **CRUD**: Create notes, reopen and edit them, and delete them.
* **Real-time saving**: Autosaves notes while editing.
* **Note search**: Filter notes with keywords.
* **Note sharing**: Share notes to enable collaboration (or viewing only).
* **Note importing**: Read text / image documents and copy content to notes.

### 4.2 Nice-to-have Features

Optional bonus features; only implement these after all must-have items
are finished

* **Formatting**: Functions to customize content, like font coloring and paragraph alignment.
* **Schedule notifications**: Set task reminders based on note content.
 
---

## 5. High-level Workflow Description (subject to changes)

| Step | Main Page | User Action | App Response | Note |
| :--- | :--- | :--- | :--- | :--- |
| 1. | N/A | Open app | Shows login / signup page |
| 2. | Login / Signup | Sign in | Displays homepage with stored notes |
| 3. | Home | (Various actions) | (Opens various pages. See below) |
| |
| a) | Note editor | Create / edit note | Saves note in real time |
| b) | Sidebar | Click x to delete note | Removes note from list |
| c) | File explorer (device) | Select file to import | Copies content to note | (to be added) |
| d) | Share popup | Enter email & set permissions | Shares note to collaborator | (to be added) |
| e) | Note viewer | Open shared note | Displays content (without edit permission) | (to be added) |

(Subject to changes)



### 5.4 Sketch / Diagram (optional)
You may attach a simple sketch (hand‑drawn photo; simple PPT drawing screenshot is
acceptable). Your sketch should illustrate major user‑facing pages/components and user
transitions between them. Professional‑quality system diagrams are not expected.


---

## 6. Full Technology-Stack Selection

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React |
| **Backend** | Node.js, Express, RESTful API, HTTP status codes |
| **Database** | MySQL |
| **Deployment** |  |
| **External Integrations** | [If any] |

---

## 7. Task Allocation

| Responsibility | Assigned To |
| :--- | :--- |
| Project Proposal Documentation | All Members |
| Frontend Development & UI Design | Lam Cheung Lam, Lin Chuen Ching |
| Backend API Development & Integration | Tam Ho Chun, Lo Kwok Ming |
| Database Schema Design | Poon Wing Lok |

---

---

## 8. Anticipated Learning Challenges & Self-assessment

**1. Unfamiliarity to new technologies (e.g., MySQL, Docker)**
  * **Plan**: With the help from teaching staff and online sources, each person dives in the technology they are working with and shares knowledge with other members. Also document setup steps / execution commands so that everyone can replicate the working environment.

**2. Integration of core parts (database -> backend -> frontend)**
  * **Plan**: Agree on data exchange rules early. Also set testing milestones for each separate module, then integrated parts so errors are caught gradually instead of all at once.
