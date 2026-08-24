# 🛒 CartIQ — Voice Command Shopping Assistant & Smart Grocery Platform

> **Technical Assessment Project Submission** | Software Engineering Position

CartIQ is a real-time, voice-first shopping list manager and smart grocery platform. It enables natural language voice ordering, automatic product categorization, smart item recommendations, alternative substitute matching, and multi-currency delivery management.

---

## 🌟 Key Features

### 1. 🎙️ Voice Input & NLP Engine
- **Natural Language Voice Recognition**: Add items, search catalog, and modify quantities hands-free using Web Speech API.
- **Sub-5ms Local Deterministic NLP Parser (`src/services/nlpService.ts`)**: Understands varied natural phrasing (*"Add 2 bottles of milk"*, *"I need organic apples under ₹200"*, *"Remove bananas"*).
- **Multilingual Support**: Supports 5 languages — English 🇺🇸 (`en-US`), Hindi 🇮🇳 (`hi-IN`), Spanish 🇪🇸 (`es-ES`), French 🇫🇷 (`fr-FR`), and German 🇩🇪 (`de-DE`).

### 2. 🧠 Smart Suggestions & Recommendations
- **History-Based Reordering**: Analyzes frequency and items running low (*"It looks like you're running low on bread"*).
- **Seasonal & Time-Aware Context**: Recommends seasonal picks and recipes based on live time-of-day (`useTimeContext.ts`).
- **Smart Substitute Matching**: Offers cheaper or organic alternatives for items in your cart.

### 3. 🛍️ Shopping List & Catalog Management
- **Automatic Item Categorization**: Auto-groups items into Dairy, Produce, Snacks, Pantry, Household, and Personal Care.
- **Morphing Quantity Steppers**: `+ ADD` buttons morph smoothly into `[ - | count | + ]` steppers with haptic scale physics.
- **Voice-Activated Search & Price Filtering**: Instant filtering by brand, category, or price cap (*"Find toothpaste under ₹300"*).

### 4. 🎨 Enterprise UI & Ambient Feedback
- **Instacart Emerald Theme**: Clean, fresh supermarket aesthetic with glassmorphism sticky headers and custom design tokens.
- **RGB Waveform Audio Equalizer**: 18-bar dynamic equalizer animating during active speech recognition.
- **Free Delivery Threshold Bar**: Progress meter tracking progress towards ₹499 free express delivery.

---

## 🏗️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest (44 Unit Tests, 100% passing)
- **Build System**: Vite 6

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js 18+** installed.

### 2. Installation
```bash
git clone https://github.com/Yash-Singh607/voice-shopping-assistant.git
cd voice-shopping-assistant
npm install
```

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in Chrome or Edge (recommended for Web Speech API support).

### 4. Running Automated Tests
```bash
npm test
```

### 5. Production Build
```bash
npm run build
```

---

## 📄 Approach & Architecture Summary (200 Words)

CartIQ was architected as a high-performance, real-time voice shopping application built with React, TypeScript, Tailwind CSS, and Framer Motion.

1. **Voice & NLP Engine**: Built an asynchronous voice engine combining the Web Speech API with a local deterministic NLP parser (`nlpService.ts`). It extracts intents (`ADD`, `REMOVE`, `SEARCH`), product attributes, numeric quantities, and price constraints under 5ms with zero API latency. Supports 5 languages (English, Hindi, Spanish, French, German).
2. **Smart Recommendation System**: Implemented frequency-based reorder heuristics, seasonal curation (`useTimeContext.ts`), and alternative substitute matching for out-of-stock items.
3. **State Management & UI UX**: Leveraged React Context for global real-time synchronization across cart drawers, list items, and localStorage. Created morphing interactive UI controls, RGB audio waveforms, threshold progress bars, and an Instacart-inspired responsive design.
4. **Quality & Testing**: Achieved 100% test coverage across 44 Vitest unit tests for NLP parsing, product searches, and recommendation algorithms, ensuring production-quality code.
