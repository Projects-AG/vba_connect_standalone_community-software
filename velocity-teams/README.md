# Velocity Teams (React + Tailwind)

Yeh aapke Stitch prototypes (`teams_tabs_dashboard`, `velocity_posts`, `velocity_calls`, `velocity_teams_prototype`) ka **one-to-one React + Tailwind conversion** hai — same colors, spacing, typography, radius, shadows, animations, sab DESIGN.md ke tokens ke saath match karta hai.

Extra: ek **Calls Hub** page bhi add ki hai jisme 1:1 aur Group calls ke liye "New Meeting" flow hai — **Meet Now (instant)** ya **Schedule Meeting**, dono support karta hai.

## Setup

```bash
npm install
npm run dev
```

Browser me `http://localhost:5173` khulega. App `/teams` route par redirect karega.

Production build ke liye:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    NavRail.jsx          -> Left icon rail (Activity/Chat/Teams/Calendar/Calls) with route-based active state
    TopHeader.jsx         -> "Velocity Teams" wordmark + search + profile bar
    NewMeetingModal.jsx   -> Instant vs Schedule + 1:1 vs Group contact picker
  pages/
    Dashboard.jsx         -> Teams workspace: General / Posts / Files / Wiki tabs
    Posts.jsx              -> Standalone Team Posts feed
    CallsHub.jsx            -> Calls landing: quick 1:1 dial, group calls, recent calls, New Meeting
    ActiveCall.jsx          -> Live video call screen (mute/camera/share/chat/leave, AI summary tile)
    StubView.jsx             -> Shared placeholder for Activity/Chat/Calendar
  data/mockData.js          -> Contacts, teams, posts, files, recent calls (swap with real API later)
  App.jsx                    -> Routes
  index.css                  -> Tailwind + design-system utility classes (glass dock, card-shadow, etc.)
tailwind.config.js            -> Exact color/spacing/font tokens pulled from your DESIGN.md
```

## Routes

| Route             | Page                                      |
|--------------------|--------------------------------------------|
| `/teams`           | Dashboard (General/Posts/Files/Wiki tabs) |
| `/posts`           | Standalone Posts feed                     |
| `/calls`           | Calls hub (1:1 / group / new meeting)     |
| `/calls/active`    | Live call screen                          |
| `/activity` `/chat` `/calendar` | Placeholder views            |

## Call functionality (as requested)

Go to **Calls** (`/calls`) in the left rail:
- **One-to-One** grid — click any contact's avatar to instantly start a 1:1 call.
- **Group Calls** — click a team card to instantly start a group call.
- **New Meeting** button (top-right, or the two big quick-action cards) opens a modal where you choose:
  - **Meet Now** (instant) or **Schedule** (pick date/time/title)
  - **One-to-One** or **Group Call**, then pick participants from the contact list.
- "Meet Now" navigates straight into the live call screen (`/calls/active`) with mute, camera, screen-share, in-call chat, and leave-call all functional (React state, no backend needed).
- "Schedule" adds the meeting to an "Upcoming Scheduled Meetings" list on the Calls page with a **Join** button.

## Customizing data

Sab mock content `src/data/mockData.js` me hai — apne real contacts/teams/files/posts se replace kar sakte hain, ya baad me ek API/backend se fetch karke same shape me pass kar dena.

## Notes

- Avatars `i.pravatar.cc` se load ho rahe hain (placeholder service) — apni company ke real photos/CDN URLs se replace kar sakte hain.
- Material Symbols aur Inter font Google Fonts se load ho rahe hain (`index.html` me already linked).
- Koi backend/database nahi hai — sab state React `useState` me hai (refresh par reset ho jayega). Persistence chahiye to ek backend ya localStorage wire kar sakte hain.
