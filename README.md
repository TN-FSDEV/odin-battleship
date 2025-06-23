# 🛳️ Odin Battleship Game (TDD Approach)

A browser-based implementation of the classic Battleship game, developed using **Test-Driven Development (TDD)** principles with **JavaScript**, **Jest**, and **HTML/CSS**.



## 📌 Features

- 🎯 Drag and drop ships onto your grid
- 🔁 Rotate ships before starting
- ⚔️ Battle against an AI opponent
- 🚢 Ships sink, miss, and hit with visual feedback
- 🧠 AI attacks intelligently based on previous hits
- 🧪 Fully unit-tested logic: Gameboard, Player, Ship, and UI rendering



## 🧪 TDD Process

The game was built using the **Red-Green-Refactor** cycle:

1. **Red** – Write a failing test that describes desired behavior
2. **Green** – Write the minimal code to make the test pass
3. **Refactor** – Clean up the code while keeping tests green

Each core module (e.g., `Ship`, `Gameboard`, `Player`) has its own test file with coverage for all major functionality.



## 💡 Lessons Learned
- Writing tests before implementation leads to clearer design
- Decoupling game logic from DOM makes testing and debugging easier
- Modular structure improves maintainability and scalability
- TDD encourages confidence and reduces regressions



