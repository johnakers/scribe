# Scribe

**Live Demo: [https://scribe.club](https://scribe.club)**

Scribe is a specialized data architect tool designed for game developers. It allows you to design, manage, and export complex JSON databases using a familiar, structured table interface.

No more wrestling with raw JSON syntax for your game's items, dialogue trees, or character stats.

![Scribe Screenshot](./example.PNG)

## 🚀 Key Features

- **Project-Based Organization:** Manage multiple game data projects from a single dashboard.
- **Tabled Data Management:** Create and organize data in structured tables, similar to a database or spreadsheet.
- **Rich Column Types:**
  - `String`: For names, descriptions, and text.
  - `Number`: For stats, costs, and values.
  - `Boolean`: For flags and toggles.
  - `Reference`: Link entries between different tables (perfect for inventory systems or skill trees).
  - `Array`: Manage lists of data within a single entry.
- **Flexible ID Strategies:** Choose between Integer (auto-increment), UUID, or Epoch (timestamp) for your entry IDs.
- **Live JSON Preview:** Instantly see the JSON structure of your project with syntax highlighting.
- **Import/Export:** Seamlessly load existing JSON files or save your projects to local storage and `.json` files.
- **Dark/Light Mode:** Full theme support for comfortable editing in any environment.
- **Search & Filter:** Quickly find projects in your library.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🏃 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/scribe.git
   cd scribe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

This project is open-source and available under the MIT License.
