# User Management App

[![Continuous Integration](https://github.com/b0ir/user-management-app-qa/actions/workflows/ci.yml/badge.svg)](https://github.com/b0ir/user-management-app-qa/actions/workflows/ci.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/b0ir/user-management-app-qa/badge)](https://www.codefactor.io/repository/github/b0ir/user-management-app-qa)
[![codecov](https://codecov.io/gh/b0ir/user-management-app-qa/graph/badge.svg?token=TJSBXO8XA9)](https://codecov.io/gh/b0ir/user-management-app-qa)

A CRUD web application for user management with a focus on comprehensive testing. Built with TypeScript and React, it includes unit, integration, and E2E testing with >90% coverage, automated CI/CD, and security analysis.

![User List](docs/images/screenshot-lista-usuarios.png)

## 🚀 Demo

**Application deployed on GitHub Pages:**
**[View application →](https://b0ir.github.io/user-management-app-qa/)**

**Test credentials:**

- Username: `any value`
- Password: `1234`

## ⚡ Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

```bash
# Clone repository
git clone https://github.com/b0ir/user-management-app-qa.git
cd user-management-app-qa

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm run build
npm run preview
```

The application will be available at `http://localhost:3000` (development) or `http://localhost:4173` (production).

## 🧪 Testing Commands

```bash
# Unit and integration tests
npm run test

# Tests with coverage report
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e

# Linting
npm run lint
```

## 🏗️ Implemented Features

- **Full CRUD** for users with real-time validation
- **Unique RUT** with Chilean validation algorithm
- **Multiple fields** for phones and addresses
- **Deletion restriction** on birthdays
- **Simulated REST API**
- **Simulated authentication** with session management
- **CI/CD with GitHub Actions** for automated testing, deployment, and security analysis with Snyk
- **E2E Tests** with Playwright
- **Code coverage** with Codecov

## 📁 Architecture

```
src/
├── __tests__/            # Tests organized by type
│   ├── integration/      # API and full-flow tests
│   └── unit/             # Unit tests (context, components, utils)
├── components/           # Modular React components
│   ├── UserForm/         # Form with hooks, utils and subcomponents
│   ├── UserList/         # List with specialized subcomponents
│   └── LoginForm.tsx     # Authentication
├── context/              # React Context for session
├── services/             # Simulated REST API with UserService
├── types/                # TypeScript interfaces (User, DTOs, ApiResponse)
├── utils/                # Validations (RUT, email, phone)
└── App.tsx               # Routing and global state
e2e/                      # End-to-End tests with Playwright
.github/workflows/        # CI/CD and security analysis
```

## 🔧 Technical Decisions

**Frontend:**

- **React + TypeScript** for type-safe development with reusable components
- **Tailwind CSS** for responsive and consistent styling
- **Vite** for fast builds and better developer experience

**Testing:**

- **Jest** for unit and integration tests with code coverage
- **Playwright** for cross-browser E2E tests, chosen for its versatility and growing industry adoption
- **CI/CD testing** automated on every push and pull request

**Validations:**

- **Chilean RUT algorithm** with check digit for local validation
- **Real-time form validation** with immediate feedback
- **Automatic formatting** of input fields

**UX/UI:**

- **Responsive design** for mobile (320px+), tablet (768px+), and desktop (1024px+)
- **Visual states** for loading, error, and validation
- **Accessible navigation** via keyboard and screen readers

## 📊 Test Coverage

- **Unit tests:** Validations (RUT, email), custom hooks, and utilities
- **Integration tests:** API, form flows, and component interactions
- **E2E tests:** Critical use cases (full CRUD, authentication, validations)
- **Coverage:** >90% on critical functions and lines with automated reporting
- **Cross-browser testing:** Chrome, Firefox, Safari, Mobile Chrome, and Mobile Safari in E2E tests
