# Nairobi Connect

A local community notice board and discussion web application for sharing neighborhood updates, safety alerts, events, and comments.

## Features

- **Authentication & Protected Routes:** Sign in with Firebase Authentication and protect private actions/routes (`AuthContext.jsx`, `ProtectedRoute.jsx`).
- **Community Notice Feed:** Browse notices with author details, timestamps, and category badges (`General`, `Community Event`, `Safety Alert`, `Lost & Found`).
- **Create, Edit & Delete Notices:** Authenticated users can publish notices and manage (**Edit** / **Delete**) notices they own.
- **Live Search & Category Filtering:** Filter notices in real time by keyword and category on the home feed.
- **Notice Discussions:** View and post comments stored under each notice's `comments` subcollection in Cloud Firestore.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend / Services:** Firebase Authentication, Cloud Firestore
- **Testing & Quality:** Vitest, Testing Library, ESLint, GitHub Actions CI

## Getting Started Locally

1. **Install dependencies:**
   ```bash
   npm install