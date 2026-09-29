# [Web Note-taking Hub] - COMP3322 PG09 Project Proposal


---

## 1. Group Information

* **Poon Wing Lok** - UID: 3036239267
* **Tam Ho Chun** - UID: 3036218342
* **Lam Cheung Lam** - UID: 3036220498
* **Lin Chuen Ching** - UID: 3035922996
* **Lo Kwok Ming** - UID: 3036067004

---


## 2. Project Description

[One paragraph summarizing your project and identifying your target
end‑users]

---

## 3. Problem & Target User Context

### 3.1 Real-Life Problems

* Heavy note-takers, such as students and professionals, often struggle to manage scattered notes across all kinds of media, from paper to tablets.
  This leads to wasted time searching and a high risk of information loss.
* These groups also handle collaborative tasks, and they need an accessible method to share instructions and important information with colleagues.</br>

- Our group aims to address these problems by developing a lightweight web application which allows users to create and store all their notes in one place.



### 3.2 Target Users & Web-based Benefits

* Students: Organize class schedules, lecture highlights, and even handwritten notes in one place.
  - Benefit: No more wasting time searching across apps/devices or transferring files manually.
* Professionals: Use shared notes as a space where project team members can easily retrieve / add insights and resources.
  - Benefit: Smoother collaboration flow and enhanced productivity.
* Casual users: Store everyday notes, like shopping lists and phone memos, in one simple hub without needing large storage.
  - Benefit: Since web apps require minimal hardware/software resources, even low-performance devices can run our app smoothly.

### 3.3 Why Web-Based (combined to 3.2)

### 3.4 Reference Websites (Optional)

---

## 4. Feature List

### 4.1 Must-have Features

Non-negotiable core features your project must complete

* **Login system**: Users must login to see their stored notes.
* **CRUD**: Create notes, reopen and edit them, and delete them.
* **Real-time saving**: Autosaves notes while editing.
* **Note sharing**: Share notes to enable collaboration (or viewing only).
* **Note importing**: Read text / image documents and copy content to notes.

### 4.2 Nice-to-have Features

Optional bonus features; only implement these after all must-have items
are finished

* **Formatting**: Functions to customize content, like font coloring and paragraph alignment.
* **Schedule notifications**: Set task reminders based on note content.
 
---

## 5. High-level Workflow Description

Describe in plain text how end-users interact with your web application. Walk through typical user journeys: what actions users take, what pages they visit, and what responses
the application provides to them. You do NOT need to describe backend-to-database data
flow details.

### 5.1 User Journey / App Flow (subtitle can be scrapped)

| Step | Main Page | User Action | App Response | Note |
| :--- | :--- | :--- | :--- | :--- |
| 1. | N/A | Open app | Shows login / signup page |
| 2. | Login / Signup | Sign in | Displays homepage with stored notes |
| 3. | Home | (Various actions) | (Opens various pages. See below) |
| |
| a) | Note editor | Create / edit note | Saves note in real time |
| b) | Delete popup | Delete note | Removes note from account | (to be added) |
| c) | File explorer (device) | Select file to import | Copies content to note | (to be added) |
| d) | Share popup | Enter email & set permissions | Shares note to collaborator | (to be added) |
| e) | Note viewer | Open shared note | Displays content (without edit permission) | (to be added) |

(Subject to changes)

### 5.2 Main Pages (combined with 5.1)

### 5.3 User Actions & App Responses (combined with 5.1)

| User Action | App Response |
| :--- | :--- |
| | |
| | |
| | |

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
